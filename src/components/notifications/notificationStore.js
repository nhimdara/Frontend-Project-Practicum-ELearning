import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../config/api";

export const formatNotificationTime = (createdAt) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(createdAt)) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${seconds < 172800 ? "" : "s"} ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(createdAt));
};

async function apiRequest(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Notification request failed.");
  return data;
}

export const useStudentNotifications = (user) => {
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    apiRequest(`/users/${userId}/notifications`)
      .then((items) => { if (active) setNotifications(Array.isArray(items) ? items : []); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshToken, userId]);

  const mutate = useCallback(async (request, optimisticUpdate) => {
    const previous = notifications;
    setNotifications(optimisticUpdate);
    try { await request(); } catch (requestError) { setNotifications(previous); setError(requestError.message); }
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: () => { setLoading(true); setError(""); setRefreshToken((value) => value + 1); },
    markRead: (id) => mutate(
      () => apiRequest(`/users/${userId}/notifications/${id}/read`, { method: "PATCH" }),
      notifications.map((item) => item.id === id ? { ...item, read: true } : item),
    ),
    markAllRead: () => mutate(
      () => apiRequest(`/users/${userId}/notifications/read-all`, { method: "POST" }),
      notifications.map((item) => ({ ...item, read: true })),
    ),
    remove: (id) => mutate(
      () => apiRequest(`/users/${userId}/notifications/${id}`, { method: "DELETE" }),
      notifications.filter((item) => item.id !== id),
    ),
    clearRead: () => mutate(
      () => apiRequest(`/users/${userId}/notifications/read`, { method: "DELETE" }),
      notifications.filter((item) => !item.read),
    ),
  };
};
