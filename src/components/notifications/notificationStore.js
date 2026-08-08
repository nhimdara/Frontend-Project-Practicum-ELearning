import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../config/api";

const EVENT_NAME = "student-notifications-updated";
const preferencesKey = (userId) => `student-notification-preferences:v2:${userId}`;

const getPreferences = (userId) => {
  try {
    const value = JSON.parse(localStorage.getItem(preferencesKey(userId)) || "{}");
    return {
      read: Array.isArray(value.read) ? value.read : [],
      dismissed: Array.isArray(value.dismissed) ? value.dismissed : [],
    };
  } catch {
    return { read: [], dismissed: [] };
  }
};

const savePreferences = (userId, preferences) => {
  localStorage.setItem(preferencesKey(userId), JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { userId } }));
};

const requestJson = async (url) => {
  const response = await fetch(url);
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return Array.isArray(data) ? data : [];
};

const validDate = (...values) => {
  const value = values.find((item) => item && !Number.isNaN(new Date(item).getTime()));
  return value ? new Date(value).toISOString() : new Date(0).toISOString();
};

const createRealNotifications = ({ enrollments, certificates, projects, lessons, major }) => {
  const items = [];

  enrollments.forEach((item) => items.push({
    id: `enrollment-${item.id || item.lesson_id}`,
    type: "lesson",
    title: "Lesson enrolled",
    message: `You are enrolled in ${item.title || "a new lesson"}.`,
    createdAt: validDate(item.enrolled_at, item.created_at),
    href: "/lessons",
  }));

  certificates.forEach((item) => items.push({
    id: `certificate-${item.id || item.credential_id}`,
    type: "achievement",
    title: "Certificate earned",
    message: `${item.title || "Your certificate"} is ready to view.`,
    createdAt: validDate(item.issued_at, item.created_at),
    href: "/profile",
  }));

  projects
    .filter((item) => !major || !item.major || String(item.major).toLowerCase() === String(major).toLowerCase())
    .forEach((item) => items.push({
      id: `project-${item.id}`,
      type: "project",
      title: item.featured ? "Featured project" : "Project available",
      message: item.title || "A new project has been published.",
      createdAt: validDate(item.updated_at, item.created_at),
      href: "/projects",
    }));

  lessons
    .filter((item) => !major || !item.major || String(item.major).toLowerCase() === String(major).toLowerCase())
    .forEach((item) => items.push({
      id: `lesson-${item.id}`,
      type: "lesson",
      title: "Lesson available",
      message: `${item.title || "A new lesson"}${item.semester ? ` · ${item.semester}` : ""}`,
      createdAt: validDate(item.updated_at, item.created_at),
      href: "/lessons",
    }));

  return items
    .filter((item) => item.id && new Date(item.createdAt).getTime() > 0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50);
};

export const formatNotificationTime = (createdAt) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(createdAt)) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${seconds < 172800 ? "" : "s"} ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(createdAt));
};

export const useStudentNotifications = (user) => {
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [preferenceState, setPreferenceState] = useState(() => ({
    userId,
    value: getPreferences(userId),
  }));
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  if (preferenceState.userId !== userId) {
    setPreferenceState({ userId, value: getPreferences(userId) });
  }
  const preferences = preferenceState.value;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;
    const majorQuery = user?.major ? `?major=${encodeURIComponent(user.major)}` : "";

    Promise.allSettled([
      requestJson(`${API_BASE_URL}/users/${userId}/enrollments`),
      requestJson(`${API_BASE_URL}/users/${userId}/certificates`),
      requestJson(`${API_BASE_URL}/projects`),
      requestJson(`${API_BASE_URL}/lessons/filter${majorQuery}`),
    ]).then((results) => {
      if (!active) return;
      const values = results.map((result) => result.status === "fulfilled" ? result.value : []);
      setNotifications(createRealNotifications({
        enrollments: values[0], certificates: values[1], projects: values[2], lessons: values[3], major: user?.major,
      }));
      const failures = results.filter((result) => result.status === "rejected");
      setError(failures.length === results.length ? "Could not load notifications from the server." : "");
      setLoading(false);
    });

    return () => { active = false; };
  }, [refreshToken, userId, user?.major]);

  useEffect(() => {
    const sync = (event) => {
      if (!event.detail || event.detail.userId === userId) {
        setPreferenceState({ userId, value: getPreferences(userId) });
      }
    };
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, [userId]);

  const updatePreferences = useCallback((recipe) => {
    setPreferenceState((current) => {
      const next = recipe(current.value);
      savePreferences(userId, next);
      return { userId, value: next };
    });
  }, [userId]);

  const visibleNotifications = useMemo(() => notifications
    .filter((item) => !preferences.dismissed.includes(item.id))
    .map((item) => ({ ...item, read: preferences.read.includes(item.id) })), [notifications, preferences]);

  return {
    notifications: visibleNotifications,
    unreadCount: visibleNotifications.filter((item) => !item.read).length,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      setError("");
      setRefreshToken((value) => value + 1);
    },
    markRead: (id) => updatePreferences((value) => ({ ...value, read: [...new Set([...value.read, id])] })),
    markAllRead: () => updatePreferences((value) => ({ ...value, read: [...new Set([...value.read, ...visibleNotifications.map((item) => item.id)])] })),
    remove: (id) => updatePreferences((value) => ({ ...value, dismissed: [...new Set([...value.dismissed, id])] })),
    clearRead: () => updatePreferences((value) => ({ ...value, dismissed: [...new Set([...value.dismissed, ...visibleNotifications.filter((item) => item.read).map((item) => item.id)])] })),
  };
};
