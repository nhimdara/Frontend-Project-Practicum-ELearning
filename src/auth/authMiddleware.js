// authMiddleware.js — All users must select major with database update
import { API_BASE_URL } from "../config/api";

const USERS_KEY = "learnflow_users";
const SESSION_KEY = "learnflow_session";
const USER_MAJOR_KEY = "learnflow_user_major";

const API_BASE = API_BASE_URL;

// ── Helpers ──────────────────────────────────────────────────
function loadClients() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveClients(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Session helpers ───────────────────────────────────────────
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  const safe = { ...user };
  delete safe.password;
  const normalizedRole = safe.role === "student" ? "client" : safe.role;
  const session = {
    ...safe,
    role: normalizedRole,
    dbRole: safe.role,
    token: safe.token,
    loginAt: new Date().toISOString(),
  };

  localStorage.removeItem(SESSION_KEY);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

async function loginWithDatabase(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: data.error || "Invalid email or password." };
  }

  const user = data.user || {};
  const session = saveSession({
    ...user,
    token: data.token,
    needsMajorSelect: user.needsMajorSelect,
  });

  const needsMajorSelect =
    session.role !== "admin" && !session.major && session.needsMajorSelect;
  let redirect = "/home";
  if (session.role === "admin") redirect = "/admin/dashboard";
  if (session.role === "teacher") {
    redirect = needsMajorSelect ? "/select-major" : "/teacher/dashboard";
  }
  if (session.role === "client") {
    redirect = needsMajorSelect ? "/select-major" : "/home";
  }

  return {
    success: true,
    user: session,
    role: session.role,
    major: session.major || null,
    needsMajorSelect,
    redirect,
  };
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_MAJOR_KEY);
}

// ── Update major for ALL users with database sync ──
export async function updateSessionMajor(major) {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    const sess = JSON.parse(raw);

    // Update session
    sess.major = major;
    sess.needsMajorSelect = false;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));

    // Update in stored users list
    const clients = loadClients();
    const idx = clients.findIndex((u) => u.email === sess.email);
    if (idx >= 0) {
      clients[idx].major = major;
      saveClients(clients);
    }

    // Save major for all users
    localStorage.setItem(USER_MAJOR_KEY, major);

    // 🔥 CRITICAL: Update major in database
    if (sess.id) {
      const response = await fetch(`${API_BASE}/users/${sess.id}/major`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sess.token}`,
        },
        body: JSON.stringify({ major }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Failed to update major in database:", error);
        // Don't fail the whole operation, but log the error
      } else {
        console.log("✅ Major updated in database successfully");
      }
    }

    return true;
  } catch (e) {
    console.error("Error updating major:", e);
    return false;
  }
}

// ── LOGIN ─────────────────────────────────────────────────────
export async function loginMiddleware(email, password) {
  if (!email || !password) {
    return { success: false, error: "Please enter your email and password." };
  }

  localStorage.removeItem(SESSION_KEY);
  try {
    return await loginWithDatabase(email.toLowerCase().trim(), password);
  } catch {
    return { success: false, error: "Unable to connect to the authentication server." };
  }
}

// ── REGISTER ─────────────────────────────────────────────────
export function registerMiddleware() {
  return {
    success: false,
    error: "Student self-registration is disabled. Please contact an administrator.",
  };
}

// ── LOGOUT ────────────────────────────────────────────────────
export function logoutMiddleware() {
  clearSession();
  return { redirect: "/login" };
}

// ── ROUTE GUARD ───────────────────────────────────────────────
export function routeGuardMiddleware(requiredRole = null) {
  const session = getSession();

  if (!session) {
    return { allowed: false, redirect: "/login" };
  }

  const normalizedRole =
    session.role === "student" || session.role === "Student"
      ? "client"
      : session.role;
  const normalizedRequiredRole =
    requiredRole === "student" ? "client" : requiredRole;

  if (requiredRole && normalizedRole !== normalizedRequiredRole) {
    let redirect = "/home";
    if (normalizedRole === "admin") redirect = "/admin/dashboard";
    if (normalizedRole === "teacher") redirect = "/teacher/dashboard";
    return { allowed: false, redirect };
  }

  if (
    normalizedRole !== "admin" &&
    !session.major &&
    session.needsMajorSelect === true
  ) {
    return { allowed: true, user: session, needsMajorSelect: true };
  }

  return { allowed: true, user: session };
}
