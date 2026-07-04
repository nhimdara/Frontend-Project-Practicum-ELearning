// authMiddleware.js — All users must select major with database update
const USERS_KEY = "learnflow_users";
const SESSION_KEY = "learnflow_session";
const USER_MAJOR_KEY = "learnflow_user_major";

const API_BASE = "http://localhost:5001/api";

// ── Hardcoded admin ──
const ADMIN_ACCOUNT = {
  id: "admin-001",
  name: "Admin",
  email: "admin@elearning.com",
  password: "Admin@123",
  role: "admin",
  major: null,
  joinDate: "2024-01-01",
  achievements: ["Super Admin"],
};

// ── Hardcoded teacher ──
const TEACHER_ACCOUNT = {
  id: "teacher-001",
  name: "Teacher",
  email: "teacher@elearning.com",
  password: "Teacher@123",
  role: "teacher",
  major: null,
  joinDate: "2024-01-01",
  achievements: ["Master Teacher"],
};

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

function findUser(email) {
  const e = email.toLowerCase().trim();

  if (ADMIN_ACCOUNT.email === e) {
    return ADMIN_ACCOUNT;
  }

  if (TEACHER_ACCOUNT.email === e) {
    const savedMajor = localStorage.getItem(USER_MAJOR_KEY);
    return {
      ...TEACHER_ACCOUNT,
      major: savedMajor || null,
    };
  }

  const clients = loadClients();
  const found = clients.find((u) => u.email === e);
  if (found) {
    const savedMajor = localStorage.getItem(USER_MAJOR_KEY);
    if (savedMajor && !found.major) {
      found.major = savedMajor;
      saveClients(clients);
    }
    return found;
  }

  return null;
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
    token: btoa(safe.email + ":" + Date.now()),
    loginAt: new Date().toISOString(),
  };

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

  const user = findUser(email);
  if (!user) {
    try {
      return await loginWithDatabase(email.toLowerCase().trim(), password);
    } catch {
      return { success: false, error: "Invalid email or password." };
    }
  }

  if (user.password !== password) {
    try {
      const databaseResult = await loginWithDatabase(
        email.toLowerCase().trim(),
        password,
      );
      if (databaseResult.success) return databaseResult;
    } catch {
      // Database login is a fallback for accounts not present in localStorage.
    }
    return { success: false, error: "Invalid email or password." };
  }

  // Check if user has a major (ALL users except admin need major)
  const isAdmin = user.role === "admin";
  const hasMajor = !!user.major;
  const needsMajorSelect = !isAdmin && !hasMajor;

  // Create session
  const session = saveSession({
    ...user,
    needsMajorSelect: needsMajorSelect,
  });

  // Determine redirect
  let redirect = "/home";
  if (user.role === "admin") {
    redirect = "/admin/dashboard";
  } else if (user.role === "teacher") {
    redirect = needsMajorSelect ? "/select-major" : "/teacher/dashboard";
  } else {
    redirect = needsMajorSelect ? "/select-major" : "/home";
  }

  return {
    success: true,
    user: session,
    role: user.role,
    major: user.major || null,
    needsMajorSelect: needsMajorSelect,
    redirect,
  };
}

// ── REGISTER ─────────────────────────────────────────────────
export function registerMiddleware(name, email, password) {
  if (!name || name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (
    normalizedEmail === ADMIN_ACCOUNT.email ||
    normalizedEmail === TEACHER_ACCOUNT.email
  ) {
    return { success: false, error: "This email address is not available." };
  }

  const clients = loadClients();
  if (clients.find((u) => u.email === normalizedEmail)) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  const newUser = {
    id: "user-" + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "client",
    major: null,
    joinDate: new Date().toISOString().split("T")[0],
    achievements: ["New Member"],
    progress: 0,
    coursesEnrolled: 0,
    certificates: 0,
  };

  clients.push(newUser);
  saveClients(clients);
  localStorage.setItem("has_registered", "true");

  const session = saveSession({
    ...newUser,
    needsMajorSelect: true,
  });

  return {
    success: true,
    user: session,
    role: "client",
    major: null,
    needsMajorSelect: true,
    redirect: "/select-major",
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
    const hasRegistered = !!localStorage.getItem("has_registered");
    return { allowed: false, redirect: hasRegistered ? "/login" : "/" };
  }

  if (requiredRole && session.role !== requiredRole) {
    let redirect = "/home";
    if (session.role === "admin") redirect = "/admin/dashboard";
    if (session.role === "teacher") redirect = "/teacher/dashboard";
    return { allowed: false, redirect };
  }

  if (
    session.role !== "admin" &&
    !session.major &&
    session.needsMajorSelect === true
  ) {
    return { allowed: true, user: session, needsMajorSelect: true };
  }

  return { allowed: true, user: session };
}
