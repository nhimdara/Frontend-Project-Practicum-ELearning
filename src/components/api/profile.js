import { API_BASE_URL } from "../../config/api";

const normalizeActorRole = (user = {}) => {
  const role = String(user?.dbRole || user?.role || "").trim().toLowerCase();
  return role === "client" ? "student" : role;
};

const examManagerHeaders = (user, includeJson = false) => {
  const headers = {
    "x-user-id": String(user?.id || ""),
    "x-user-role": normalizeActorRole(user),
  };
  return includeJson
    ? {
        "Content-Type": "application/json",
        ...headers,
      }
    : headers;
};

export const profileApi = {
  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/users`);
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data.error || "Could not load students.");
    return Array.isArray(data) ? data : [];
  },

  async getProfile(userId) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not load profile.");
    return data;
  },

  async updateProfile(userId, payload) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not save profile.");
    return data.user;
  },

  async uploadAvatar(userId, image) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not upload profile photo.");
    return data.user;
  },

  async getCertificates(userId) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/certificates`);
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data.error || "Could not load certificates.");
    return Array.isArray(data) ? data : [];
  },

  async getAllCertificates() {
    const res = await fetch(`${API_BASE_URL}/certificates`);
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data.error || "Could not load certificates.");
    return Array.isArray(data) ? data : [];
  },

  async generateCertificate(payload) {
    const res = await fetch(`${API_BASE_URL}/certificates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not generate certificate.");
    return data.certificate;
  },

  async deleteCertificate(certificateId) {
    const res = await fetch(`${API_BASE_URL}/certificates/${certificateId}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not delete certificate.");
    return data;
  },

  async getExamByMajor(major, user = null) {
    const res = await fetch(`${API_BASE_URL}/exams/by-major/${encodeURIComponent(major)}`, {
      headers: user ? examManagerHeaders(user) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not load exam.");
    return data;
  },

  async submitExam(userId, payload) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/exam-attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not submit exam.");
    return data;
  },

  async addExamQuestion(major, user, payload) {
    const actorRole = normalizeActorRole(user);
    const res = await fetch(`${API_BASE_URL}/exams/by-major/${encodeURIComponent(major)}/questions`, {
      method: "POST",
      headers: examManagerHeaders(user, true),
      body: JSON.stringify({
        ...payload,
        actorUserId: user?.id,
        actorRole,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not add exam question.");
    return data;
  },

  async updateExamQuestion(major, questionId, user, payload) {
    const actorRole = normalizeActorRole(user);
    const res = await fetch(
      `${API_BASE_URL}/exams/by-major/${encodeURIComponent(major)}/questions/${encodeURIComponent(questionId)}`,
      {
        method: "PUT",
        headers: examManagerHeaders(user, true),
        body: JSON.stringify({
          ...payload,
          actorUserId: user?.id,
          actorRole,
        }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not update exam question.");
    return data;
  },

  async deleteExamQuestion(major, questionId, user) {
    const res = await fetch(
      `${API_BASE_URL}/exams/by-major/${encodeURIComponent(major)}/questions/${encodeURIComponent(questionId)}`,
      {
        method: "DELETE",
        headers: examManagerHeaders(user),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not delete exam question.");
    return data;
  },
};

export function syncStoredSession(profile) {
  try {
    const session = JSON.parse(localStorage.getItem("learnflow_session") || "null");
    if (!session) return;
    const dbRole = profile.dbRole || session.dbRole;
    const role =
      dbRole === "student" ? "client" : session.role === "Student" ? "client" : session.role;
    localStorage.setItem(
      "learnflow_session",
      JSON.stringify({
        ...session,
        ...profile,
        role,
        dbRole,
      }),
    );
  } catch {
    // Session sync is best-effort; the API remains the source of truth.
  }
}
