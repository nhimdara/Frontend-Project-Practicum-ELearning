// TeacherDashboard.jsx — Complete with major filtering
import React, { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { API_BASE_URL } from "../../config/api";
import ExamQuestionForm from "./ExamQuestionForm";
import logo from "./../assets/image/logo.png";

import {
  LayoutDashboard,
  BookOpen,
  Video,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Youtube,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  X,
  LogOut,
  Search,
  Play,
  Clock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Layers,
  Menu,
  Moon,
  Settings,
  Sun,
  ClipboardCheck,
  Download,
} from "lucide-react";

const API_BASE = API_BASE_URL;
const TEACHER_APPROVED_TAG = "teacher-approved";
const PROJECT_MAJOR_PREFIX = "major:";

const normalizeProjectTags = (tags) =>
  Array.isArray(tags)
    ? tags
    : String(tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

const getProjectMajor = (project) => {
  const explicitMajor = project.major || project.student_major;
  if (explicitMajor) return explicitMajor;
  const majorTag = normalizeProjectTags(project.tags).find((tag) =>
    tag.startsWith(PROJECT_MAJOR_PREFIX),
  );
  return majorTag ? majorTag.slice(PROJECT_MAJOR_PREFIX.length) : "";
};

const getStoredTheme = () => {
  try {
    return JSON.parse(localStorage.getItem("learnflow_settings") || "{}").theme || "light";
  } catch {
    return "light";
  }
};

const applyStoredTheme = (theme) => {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark-mode", isDark);

  try {
    const settings = JSON.parse(
      localStorage.getItem("learnflow_settings") || "{}",
    );
    localStorage.setItem(
      "learnflow_settings",
      JSON.stringify({ ...settings, theme }),
    );
  } catch {
    localStorage.setItem("learnflow_settings", JSON.stringify({ theme }));
  }
};

// ─────────────────────────────────────────────────────────────
//  YOUTUBE HELPERS
// ─────────────────────────────────────────────────────────────
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function getYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

function dedupeVideosByLessonSlot(videos = []) {
  const bySlot = new Map();
  videos.forEach((video) => {
    const key = `${video.lesson_id}:${video.order_index || 1}`;
    const current = bySlot.get(key);
    if (!current || Number(video.id) > Number(current.id)) {
      bySlot.set(key, video);
    }
  });
  return [...bySlot.values()].sort(
    (a, b) =>
      Number(a.lesson_id) - Number(b.lesson_id) ||
      Number(a.order_index || 1) - Number(b.order_index || 1) ||
      Number(a.id) - Number(b.id),
  );
}

// ─────────────────────────────────────────────────────────────
//  FETCH FUNCTIONS
// ─────────────────────────────────────────────────────────────
async function fetchLessonsFromAPI() {
  const res = await fetch(`${API_BASE}/lessons`);
  if (!res.ok) throw new Error(`Failed to fetch lessons: ${res.status}`);
  return res.json();
}

async function fetchVideosFromAPI() {
  const res = await fetch(`${API_BASE}/videos`);
  if (!res.ok) throw new Error(`Failed to fetch videos: ${res.status}`);
  return res.json();
}

async function createVideoAPI(videoData) {
  const res = await fetch(`${API_BASE}/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(videoData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create video");
  }
  return res.json();
}

async function updateVideoAPI(id, videoData) {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(videoData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update video");
  }
  return res.json();
}

async function deleteVideoAPI(id) {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete video");
  }
  return res.json();
}

async function fetchProjectsFromAPI() {
  const res = await fetch(`${API_BASE}/projects?include_inactive=1`);
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
  return res.json();
}

async function approveProjectAPI(project) {
  const projectTags = normalizeProjectTags(project.tags);
  const res = await fetch(`${API_BASE}/projects/${project.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...project,
      image: project.image || project.image_url || "",
      tags: [...new Set([...projectTags, TEACHER_APPROVED_TAG])],
      github_url: project.github_url || project.github || "",
      live_url: project.live_url || project.demo_url || "",
      major: getProjectMajor(project),
      student_major: getProjectMajor(project),
      teacher_approved: true,
      admin_approved: false,
      approval_status: "admin_pending",
      is_active: false,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to approve project");
  return data;
}

// ─────────────────────────────────────────────────────────────
//  NOTIFICATION COMPONENT
// ─────────────────────────────────────────────────────────────
const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
        border: `1px solid ${toast.type === "success" ? "#a7f3d0" : "#fecaca"}`,
        borderRadius: "12px",
        padding: "12px 18px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        color: toast.type === "success" ? "#065f46" : "#991b1b",
        animation: "slideUp 0.25s ease",
        minWidth: "260px",
        maxWidth: "340px",
      }}
    >
      {toast.type === "success" ? (
        <CheckCircle size={17} style={{ flexShrink: 0 }} />
      ) : (
        <AlertCircle size={17} style={{ flexShrink: 0 }} />
      )}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "inherit",
          opacity: 0.7,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  VIDEO CARD
// ─────────────────────────────────────────────────────────────
const VideoCard = ({ video, lesson, onEdit, onDelete }) => {
  const ytId = extractYouTubeId(video.link);
  const thumb = ytId ? getYouTubeThumbnail(ytId) : null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#111827",
          aspectRatio: "16/9",
        }}
      >
        {thumb ? (
          <img
            src={thumb}
            alt={video.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.92,
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Youtube size={32} color="#6b7280" />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: video.is_free ? "#ecfdf5" : "#fef3c7",
            color: video.is_free ? "#065f46" : "#92400e",
            border: `1px solid ${video.is_free ? "#a7f3d0" : "#fde68a"}`,
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 8px",
            letterSpacing: "0.02em",
          }}
        >
          {video.is_free ? "FREE" : "PAID"}
        </div>
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 8px",
          }}
        >
          #{video.order_index}
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#111827",
            margin: "0 0 4px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {video.title}
        </p>

        {lesson && (
          <p
            style={{
              fontSize: "11px",
              color: "#6366f1",
              margin: "0 0 6px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <BookOpen size={11} />
            {lesson.title}
          </p>
        )}

        {video.description && (
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              margin: "0 0 10px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.description}
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "12px",
              color: "#9ca3af",
            }}
          >
            <Clock size={12} />
            {video.duration_minutes ? `${video.duration_minutes} min` : "–"}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => window.open(video.link, "_blank")}
              title="Open on YouTube"
              style={{
                background: "none",
                border: "1px solid #e5e7eb",
                borderRadius: "7px",
                padding: "5px 8px",
                cursor: "pointer",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              <ExternalLink size={13} />
            </button>
            <button
              onClick={() => onEdit(video)}
              title="Edit"
              style={{
                background: "none",
                border: "1px solid #e5e7eb",
                borderRadius: "7px",
                padding: "5px 8px",
                cursor: "pointer",
                color: "#6366f1",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eef2ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
              }}
            >
              <Edit3 size={13} />
            </button>
            <button
              onClick={() => onDelete(video.id)}
              title="Delete"
              style={{
                background: "none",
                border: "1px solid #fee2e2",
                borderRadius: "7px",
                padding: "5px 8px",
                cursor: "pointer",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  VIDEO FORM MODAL
// ─────────────────────────────────────────────────────────────
const VideoFormModal = ({ isOpen, onClose, onSave, editingVideo, lessons }) => {
  const [form, setForm] = useState({
    lesson_id: "",
    title: "",
    link: "",
    duration_minutes: "",
    description: "",
    is_free: false,
    order_index: 1,
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingVideo) {
      setForm({
        lesson_id: editingVideo.lesson_id,
        title: editingVideo.title,
        link: editingVideo.link,
        duration_minutes: editingVideo.duration_minutes || "",
        description: editingVideo.description || "",
        is_free: editingVideo.is_free === 1 || editingVideo.is_free === true,
        order_index: editingVideo.order_index,
      });
      const id = extractYouTubeId(editingVideo.link);
      setPreview(id);
    } else {
      setForm({
        lesson_id: "",
        title: "",
        link: "",
        duration_minutes: "",
        description: "",
        is_free: false,
        order_index: 1,
      });
      setPreview(null);
    }
    setErrors({});
  }, [editingVideo, isOpen]);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));

    if (field === "link") {
      const id = extractYouTubeId(value);
      setPreview(id || null);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.lesson_id) e.lesson_id = "Please select a lesson";
    if (!form.title.trim() || form.title.trim().length < 3)
      e.title = "Title must be at least 3 characters";
    if (!form.link.trim()) {
      e.link = "YouTube URL is required";
    } else if (!extractYouTubeId(form.link)) {
      e.link =
        "Invalid YouTube URL — paste a valid youtube.com or youtu.be link";
    }
    if (
      form.duration_minutes &&
      (isNaN(form.duration_minutes) || +form.duration_minutes < 1)
    ) {
      e.duration_minutes = "Duration must be a positive number";
    }
    if (!form.order_index || isNaN(form.order_index) || +form.order_index < 1) {
      e.order_index = "Order must be a positive number";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        ...form,
        duration_minutes: form.duration_minutes ? +form.duration_minutes : null,
        order_index: +form.order_index,
        is_free: form.is_free ? 1 : 0,
      });
      onClose();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = (field) => ({
    width: "100%",
    padding: "9px 12px",
    border: `1px solid ${errors[field] ? "#fca5a5" : "#d1d5db"}`,
    borderRadius: "9px",
    fontSize: "13.5px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#111827",
    background: errors[field] ? "#fef2f2" : "#f9fafb",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  });

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "5px",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            padding: "22px 28px 18px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Youtube size={18} color="#fff" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {editingVideo ? "Edit Video" : "Add New Video"}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                {editingVideo
                  ? "Update video details"
                  : "Add a YouTube video to a lesson"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "22px 28px" }}>
          {errors.general && (
            <div
              style={{ marginBottom: 16, color: "#ef4444", fontSize: "13px" }}
            >
              {errors.general}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Lesson *</label>
            <select
              value={form.lesson_id}
              onChange={(e) => handleChange("lesson_id", e.target.value)}
              style={{ ...inputStyle("lesson_id"), cursor: "pointer" }}
            >
              <option value="">— Select a lesson —</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            {errors.lesson_id && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.lesson_id}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Video Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Introduction to Variables"
              style={inputStyle("title")}
            />
            {errors.title && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.title}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>YouTube URL *</label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              >
                <Youtube size={16} />
              </div>
              <input
                type="url"
                value={form.link}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ ...inputStyle("link"), paddingLeft: "36px" }}
              />
            </div>
            {errors.link && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.link}
              </p>
            )}
            {!errors.link && form.link && !preview && (
              <p
                style={{
                  color: "#f59e0b",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                Paste a valid YouTube link to see a preview
              </p>
            )}
          </div>

          {preview && (
            <div
              style={{
                marginBottom: 16,
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                background: "#000",
              }}
            >
              <div style={{ position: "relative", paddingTop: "56.25%" }}>
                <iframe
                  src={getYouTubeEmbedUrl(preview)}
                  title="YouTube preview"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  allowFullScreen
                />
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CheckCircle size={14} color="#10b981" />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#10b981",
                    fontWeight: 600,
                  }}
                >
                  Valid YouTube video detected
                </span>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <label style={labelStyle}>Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={form.duration_minutes}
                onChange={(e) =>
                  handleChange("duration_minutes", e.target.value)
                }
                placeholder="e.g. 15"
                style={inputStyle("duration_minutes")}
              />
              {errors.duration_minutes && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    margin: "4px 0 0",
                  }}
                >
                  {errors.duration_minutes}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Order Index *</label>
              <input
                type="number"
                min="1"
                value={form.order_index}
                onChange={(e) => handleChange("order_index", e.target.value)}
                placeholder="e.g. 1"
                style={inputStyle("order_index")}
              />
              {errors.order_index && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    margin: "4px 0 0",
                  }}
                >
                  {errors.order_index}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of what this video covers…"
              rows={3}
              style={{
                ...inputStyle("description"),
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "#f9fafb",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              marginBottom: 22,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                {form.is_free ? (
                  <>
                    <Eye
                      size={14}
                      style={{ verticalAlign: -2, marginRight: 5 }}
                    />
                    Free to watch
                  </>
                ) : (
                  <>
                    <EyeOff
                      size={14}
                      style={{ verticalAlign: -2, marginRight: 5 }}
                    />
                    Paid content
                  </>
                )}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                {form.is_free
                  ? "Anyone can watch without enrollment"
                  : "Only enrolled students can watch"}
              </p>
            </div>
            <button
              onClick={() => handleChange("is_free", !form.is_free)}
              style={{
                width: 44,
                height: 24,
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: form.is_free ? "#6366f1" : "#d1d5db",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: form.is_free ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                border: "none",
                background: isSaving
                  ? "#a5b4fc"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "opacity 0.2s",
              }}
            >
              {isSaving ? (
                <>
                  <RefreshCw
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Saving…
                </>
              ) : (
                <>
                  <Save size={14} />{" "}
                  {editingVideo ? "Update Video" : "Add Video"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  MAIN TEACHER DASHBOARD
// ─────────────────────────────────────────────────────────────
const TeacherDashboard = ({ user, onLogout }) => {
  const [videos, setVideos] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [filterLesson, setFilterLesson] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(getStoredTheme);
  const [examReportData, setExamReportData] = useState({
    major: "",
    questions: [],
  });

  // ========== CASCADING DROPDOWN STATES ==========
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // ========== TEACHER'S MAJOR from session ==========
  const teacherMajor = user?.major || null;

  useEffect(() => {
    applyStoredTheme(themeMode);
  }, [themeMode]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleThemeChange = (theme) => {
    setThemeMode(theme);
    applyStoredTheme(theme);
    showToast(`${theme === "dark" ? "Dark" : "Light"} mode enabled.`);
  };

  // Load initial data - filter lessons by teacher's major
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [videosData, lessonsData, projectsData] = await Promise.all([
        fetchVideosFromAPI(),
        fetchLessonsFromAPI(),
        fetchProjectsFromAPI(),
      ]);
      setVideos(dedupeVideosByLessonSlot(videosData));
      setProjects(Array.isArray(projectsData) ? projectsData : []);

      // Filter lessons by teacher's selected major
      if (teacherMajor) {
        const filteredLessons = lessonsData.filter(
          (lesson) => lesson.major === teacherMajor,
        );
        setLessons(filteredLessons);
      } else {
        setLessons(lessonsData);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [teacherMajor]);

  // ========== 1. Fetch Years on mount ==========
  useEffect(() => {
    fetch(`${API_BASE}/years`)
      .then((res) => res.json())
      .then(setYears)
      .catch((err) => console.error("Failed to fetch years:", err));
  }, []);

  // ========== 2. Fetch Semesters when Year changes ==========
  useEffect(() => {
    if (selectedYear) {
      fetch(`${API_BASE}/semesters?year_id=${selectedYear}`)
        .then((res) => res.json())
        .then(setSemesters)
        .catch((err) => console.error("Failed to fetch semesters:", err));
      setSelectedSemester("");
      setSelectedSubject("");
    } else {
      setSemesters([]);
      setSelectedSemester("");
      setSelectedSubject("");
    }
  }, [selectedYear]);

  // ========== 3. Fetch Subjects when Year or Semester changes ==========
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        let url = `${API_BASE}/lessons/filter`;
        const params = new URLSearchParams();
        if (selectedYear) params.append("year_id", selectedYear);
        if (selectedSemester) params.append("semester_id", selectedSemester);
        // Add major filter for teacher
        if (teacherMajor) params.append("major", teacherMajor);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setSubjects([]);
      }
      setSelectedSubject("");
    };

    if (selectedYear) {
      fetchSubjects();
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedYear, selectedSemester, teacherMajor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stats - filter videos by teacher's major lessons
  const teacherLessonIds = lessons.map((l) => String(l.id));
  const teacherVideos = dedupeVideosByLessonSlot(
    videos.filter((v) => teacherLessonIds.includes(String(v.lesson_id))),
  );

  const stats = {
    totalVideos: teacherVideos.length,
    freeVideos: teacherVideos.filter((v) => v.is_free).length,
    paidVideos: teacherVideos.filter((v) => !v.is_free).length,
    lessonsWithVideo: [...new Set(teacherVideos.map((v) => v.lesson_id))]
      .length,
    totalMinutes: teacherVideos.reduce(
      (sum, v) => sum + (v.duration_minutes || 0),
      0,
    ),
  };

  // Filtered videos - only show teacher's videos
  const filteredVideos = teacherVideos.filter((v) => {
    const matchLesson =
      filterLesson === "all" || String(v.lesson_id) === String(filterLesson);
    const matchSearch =
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchLesson && matchSearch;
  });

  // Filter lessons based on selected filters
  const getFilteredLessons = () => {
    let result = lessons;

    if (selectedSubject) {
      result = result.filter(
        (lesson) => String(lesson.id) === String(selectedSubject),
      );
    } else if (subjects.length > 0 && (selectedYear || selectedSemester)) {
      result = subjects;
    }

    if (
      !selectedSubject &&
      (selectedYear || selectedSemester) &&
      subjects.length > 0
    ) {
      result = subjects;
    }

    return result;
  };

  const filteredLessons = getFilteredLessons();

  // Videos grouped by lesson
  const videosByLesson = filteredLessons
    .map((lesson) => ({
      lesson,
      videos: teacherVideos
        .filter((v) => String(v.lesson_id) === String(lesson.id))
        .sort((a, b) => a.order_index - b.order_index),
    }))
    .filter((g) => g.videos.length > 0);

  // Save handler
  const handleSave = useCallback(
    async (formData) => {
      try {
        if (formData.id) {
          await updateVideoAPI(formData.id, formData);
          showToast("Video updated successfully!");
        } else {
          await createVideoAPI(formData);
          showToast("Video added successfully!");
        }
        await loadData();
        setEditingVideo(null);
      } catch (err) {
        showToast(err.message, "error");
        throw err;
      }
    },
    [loadData],
  );

  // Delete handler
  const handleDelete = useCallback(
    async (videoId) => {
      try {
        await deleteVideoAPI(videoId);
        await loadData();
        showToast("Video deleted.", "error");
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setDeleteConfirm(null);
      }
    },
    [loadData],
  );

  const openAdd = () => {
    setEditingVideo(null);
    setIsFormOpen(true);
    setMobileMenuOpen(false);
  };

  const openEdit = (video) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleApproveProject = async (project) => {
    try {
      await approveProjectAPI(project);
      setProjects((prev) =>
        prev.map((item) =>
          item.id === project.id
            ? {
                ...item,
                tags: [
                  ...new Set([
                    ...normalizeProjectTags(item.tags),
                    TEACHER_APPROVED_TAG,
                  ]),
                ],
                teacher_approved: true,
                admin_approved: false,
                approval_status: "admin_pending",
                is_active: false,
              }
            : item,
        ),
      );
      showToast("Project sent to admin for final approval.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const pendingProjects = projects.filter(
    (project) => {
      const tags = normalizeProjectTags(project.tags);
      const projectMajor = getProjectMajor(project);
      const matchesTeacherMajor =
        !teacherMajor || !projectMajor || projectMajor === teacherMajor;
      return (
        matchesTeacherMajor &&
        (project.is_active === false ||
          project.is_active === 0 ||
          project.is_active === "0") &&
        project.teacher_approved !== true &&
        project.teacher_approved !== 1 &&
        project.teacher_approved !== "1" &&
        !tags.includes(TEACHER_APPROVED_TAG)
      );
    },
  );

  const getTeacherReport = () => {
    const lessonTitle = (lessonId) =>
      lessons.find((lesson) => String(lesson.id) === String(lessonId))?.title ||
      "Unknown lesson";

    if (activeTab === "overview") {
      return {
        name: "teacher-overview-report",
        title: "Teacher Dashboard Overview Report",
        headers: ["Metric", "Value", "Details"],
        rows: [
          ["Teacher", user?.name || "Teacher", user?.email || ""],
          ["Major", teacherMajor || "All majors", "Teaching assignment"],
          ["Lessons", lessons.length, "Available lessons"],
          ["Videos", stats.totalVideos, `${stats.totalMinutes} total minutes`],
          ["Free Videos", stats.freeVideos, `${stats.paidVideos} enrolled-only videos`],
          ["Lessons With Video", stats.lessonsWithVideo, "Lessons containing video content"],
          ["Pending Projects", pendingProjects.length, "Awaiting teacher review"],
        ],
      };
    }

    if (activeTab === "videos") {
      return {
        name: "teacher-video-report",
        title: "Teacher Video Report",
        headers: ["ID", "Title", "Lesson", "Duration", "Access", "Order", "Link"],
        rows: filteredVideos.map((video) => [
          video.id,
          video.title,
          lessonTitle(video.lesson_id),
          `${video.duration_minutes || 0} min`,
          video.is_free ? "Free" : "Enrolled only",
          video.order_index || 1,
          video.link || "",
        ]),
      };
    }

    if (activeTab === "by-lesson") {
      return {
        name: "teacher-videos-by-lesson-report",
        title: "Videos By Lesson Report",
        headers: ["Lesson", "Video", "Duration", "Access", "Order"],
        rows: videosByLesson.flatMap(({ lesson, videos: lessonVideos }) =>
          lessonVideos.map((video) => [
            lesson.title,
            video.title,
            `${video.duration_minutes || 0} min`,
            video.is_free ? "Free" : "Enrolled only",
            video.order_index || 1,
          ]),
        ),
      };
    }

    if (activeTab === "lessons") {
      return {
        name: "teacher-lesson-report",
        title: "Teacher Lesson Report",
        headers: ["ID", "Title", "Major", "Year", "Semester", "Level", "Credits", "Status"],
        rows: filteredLessons.map((lesson) => [
          lesson.id,
          lesson.title,
          lesson.major || "",
          lesson.year || "",
          lesson.semester || "",
          lesson.level || "",
          lesson.credit ?? "",
          lesson.is_published === false || lesson.is_published === 0
            ? "Draft"
            : "Published",
        ]),
      };
    }

    if (activeTab === "projects") {
      return {
        name: "teacher-project-request-report",
        title: "Teacher Project Request Report",
        headers: ["ID", "Title", "Student", "Major", "Tags", "Status", "GitHub URL", "Live URL"],
        rows: pendingProjects.map((project) => [
          project.id,
          project.title,
          project.student_name || project.user_name || project.author || "",
          getProjectMajor(project) || teacherMajor || "",
          normalizeProjectTags(project.tags)
            .filter((tag) => tag !== TEACHER_APPROVED_TAG && !tag.startsWith(PROJECT_MAJOR_PREFIX))
            .join(", "),
          "Teacher review",
          project.github_url || project.github || "",
          project.live_url || project.demo_url || "",
        ]),
      };
    }

    if (activeTab === "exam") {
      return {
        name: `teacher-exam-question-report-${examReportData.major || teacherMajor || "all"}`,
        title: `${examReportData.major || teacherMajor || "All Majors"} Exam Question Report`,
        headers: ["No.", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer"],
        rows: (examReportData.questions || []).map((question, index) => {
          const options = Array.isArray(question.options)
            ? question.options.slice(0, 4)
            : [];
          while (options.length < 4) options.push("");
          const correctIndex = Math.min(
            3,
            Math.max(0, Number(question.correctAnswer ?? 0)),
          );
          return [
            index + 1,
            question.question || "",
            ...options,
            `${String.fromCharCode(65 + correctIndex)}${options[correctIndex] ? ` - ${options[correctIndex]}` : ""}`,
          ];
        }),
      };
    }

    return null;
  };

  const generateTeacherReport = () => {
    const report = getTeacherReport();
    if (!report) return;

    try {
      const landscape = report.headers.length > 6;
      const doc = new jsPDF({
        orientation: landscape ? "landscape" : "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const totalPagesPlaceholder = "{total_pages_count_string}";
      const generatedAt = new Date().toLocaleString();

      doc.setProperties({
        title: report.title,
        subject: "LearnFlow teacher report",
        author: user?.name || "LearnFlow Teacher",
        creator: "LearnFlow",
      });

      autoTable(doc, {
        head: [report.headers],
        body: report.rows.map((row) => row.map((value) => value ?? "")),
        startY: 118,
        margin: { top: 76, right: 30, bottom: 42, left: 30 },
        theme: "striped",
        showHead: "everyPage",
        rowPageBreak: "avoid",
        styles: {
          font: "helvetica",
          fontSize: landscape ? 7 : 8,
          textColor: [51, 65, 85],
          cellPadding: landscape ? 3.5 : 5,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          lineColor: [67, 56, 202],
          lineWidth: 0.5,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        willDrawPage: (data) => {
          doc.setFillColor(30, 41, 59);
          doc.rect(0, 0, pageWidth, 60, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(17);
          doc.setTextColor(255, 255, 255);
          doc.text(report.title, 30, 30);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(203, 213, 225);
          doc.text(`LearnFlow Teacher - Generated ${generatedAt}`, 30, 46);

          if (data.pageNumber === 1) {
            doc.setFillColor(238, 242, 255);
            doc.roundedRect(30, 74, 150, 29, 4, 4, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(67, 56, 202);
            doc.text("TOTAL RECORDS", 41, 86);
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text(String(report.rows.length), 41, 99);
          }
        },
        didDrawPage: (data) => {
          doc.setDrawColor(226, 232, 240);
          doc.line(30, pageHeight - 30, pageWidth - 30, pageHeight - 30);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(`${user?.name || "Teacher"} - ${teacherMajor || "All majors"}`, 30, pageHeight - 17);
          doc.text(
            `Page ${data.pageNumber} of ${totalPagesPlaceholder}`,
            pageWidth - 30,
            pageHeight - 17,
            { align: "right" },
          );
        },
      });

      if (typeof doc.putTotalPages === "function") {
        doc.putTotalPages(totalPagesPlaceholder);
      }
      const date = new Date().toISOString().slice(0, 10);
      doc.save(`${report.name}-${date}.pdf`);
    } catch (err) {
      console.error("generateTeacherReport:", err);
      alert(
        `Could not generate the PDF report.${err?.message ? ` ${err.message}` : ""}`,
      );
    }
  };

  const activeTeacherReport = getTeacherReport();

  // Sidebar nav
  const navItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "videos", icon: Video, label: "All Videos" },
    { id: "by-lesson", icon: Layers, label: "By Lesson" },
    { id: "lessons", icon: BookOpen, label: "Lessons" },
    { id: "projects", icon: ClipboardCheck, label: "Project Requests" },
    { id: "exam", icon: CheckCircle, label: "Exam Questions" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const sidebarStyle = {
    width: 260,
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const mainStyle = {
    flex: 1,
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'DM Sans', sans-serif",
    overflow: "auto",
    width: "100%",
  };

  const mobileMenuButtonStyle = {
    display: "none",
    position: "fixed",
    top: "16px",
    left: "16px",
    zIndex: 20,
    background: "#0f172a",
    border: "none",
    borderRadius: "8px",
    padding: "8px",
    cursor: "pointer",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const mobileOverlayStyle = {
    display: "none",
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 15,
  };

  if (loading) {
    return (
      <div className="teacher-dashboard-root" style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={sidebarStyle} />
        <main style={mainStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
            }}
          >
            <RefreshCw
              size={32}
              style={{ animation: "spin 1s linear infinite" }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={mobileMenuButtonStyle}
        className={`mobile-menu-button ${mobileMenuOpen ? "is-open" : ""}`}
        aria-label={mobileMenuOpen ? "Close teacher menu" : "Open teacher menu"}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        style={mobileOverlayStyle}
        className={`mobile-overlay ${mobileMenuOpen ? "is-open" : ""}`}
      />

      <div
        className="teacher-dashboard-root"
        style={{ display: "flex", minHeight: "100vh", position: "relative" }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            ...sidebarStyle,
            transform: "translateX(0)",
            transition: "transform 0.3s ease",
            position: "sticky",
            top: 0,
            left: 0,
            height: "100vh",
            overflowY: "auto",
            zIndex: 16,
          }}
          className={`sidebar ${mobileMenuOpen ? "is-open" : ""}`}
        >
          <div
            style={{
              padding: "24px 20px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                <img
                  src={logo}
                  alt="Elearning Logo"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#f8fafc",
                  }}
                >
                  Elearning
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    color: "#64748b",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Teacher
                </p>
              </div>
            </div>
            {teacherMajor && (
              <div
                style={{
                  marginTop: 10,
                  padding: "4px 10px",
                  background: "rgba(99,102,241,0.15)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#a5b4fc",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                Major: {teacherMajor}
              </div>
            )}
          </div>

          <nav style={{ flex: 1, padding: "12px 10px" }}>
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: "9px",
                  border: "none",
                  background:
                    activeTab === id ? "rgba(99,102,241,0.15)" : "transparent",
                  color: activeTab === id ? "#a5b4fc" : "#64748b",
                  fontSize: "13.5px",
                  fontWeight: activeTab === id ? 600 : 400,
                  cursor: "pointer",
                  marginBottom: 2,
                  textAlign: "left",
                  fontFamily: "'DM Sans', sans-serif",
                  borderLeft:
                    activeTab === id
                      ? "2px solid #6366f1"
                      : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          <div style={{ padding: "12px 10px" }}>
            <button
              onClick={openAdd}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 8,
              }}
            >
              <Plus size={15} />
              Add Video
            </button>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {(user?.name || "T")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "Teacher"}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#64748b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: 4,
                display: "flex",
                alignItems: "center",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={mainStyle} className="teacher-main">
          {activeTeacherReport && (
            <div
              className="teacher-report-toolbar"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "16px 20px 0",
              }}
            >
              <button
                type="button"
                onClick={generateTeacherReport}
                title={`Generate ${activeTeacherReport.title}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "none",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  color: "#fff",
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(79,70,229,0.22)",
                }}
              >
                <Download size={16} />
                Generate Report
              </button>
            </div>
          )}
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="teacher-content-section" style={{ padding: "24px 20px" }}>
              <div style={{ marginBottom: 28 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(20px, 5vw, 24px)",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Welcome back, {user?.name?.split(" ")[0] || "Teacher"} 👋
                </h1>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Manage your lesson videos and track content progress
                </p>
                {teacherMajor && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#6366f1",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    Teaching: {teacherMajor}
                  </p>
                )}
              </div>

              {/* Stats grid */}
              <div
                className="teacher-stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 14,
                  marginBottom: 32,
                }}
              >
                {[
                  {
                    label: "Total Videos",
                    value: stats.totalVideos,
                    icon: Video,
                    color: "#6366f1",
                    bg: "#eef2ff",
                  },
                  {
                    label: "Free Videos",
                    value: stats.freeVideos,
                    icon: Eye,
                    color: "#10b981",
                    bg: "#ecfdf5",
                  },
                  {
                    label: "Paid Videos",
                    value: stats.paidVideos,
                    icon: EyeOff,
                    color: "#f59e0b",
                    bg: "#fffbeb",
                  },
                  {
                    label: "Lessons Covered",
                    value: stats.lessonsWithVideo,
                    icon: BookOpen,
                    color: "#8b5cf6",
                    bg: "#f5f3ff",
                  },
                  {
                    label: "Total Minutes",
                    value: stats.totalMinutes,
                    icon: Clock,
                    color: "#06b6d4",
                    bg: "#ecfeff",
                  },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div
                    key={label}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "18px 20px",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: bg,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Icon size={18} color={color} />
                    </div>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontSize: "clamp(18px, 4vw, 22px)",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {value}
                    </p>
                    <p
                      style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent videos */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Recent Videos
                  </h2>
                  <button
                    onClick={() => setActiveTab("videos")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6366f1",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    View all →
                  </button>
                </div>
                {teacherVideos.length === 0 ? (
                  <div
                    style={{
                      background: "#fff",
                      border: "2px dashed #e5e7eb",
                      borderRadius: "16px",
                      padding: "48px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Youtube
                      size={40}
                      color="#d1d5db"
                      style={{ marginBottom: 12 }}
                    />
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      No videos yet
                    </p>
                    <p
                      style={{
                        margin: "0 0 18px",
                        fontSize: "13px",
                        color: "#9ca3af",
                      }}
                    >
                      Add your first YouTube video to a lesson
                    </p>
                    <button
                      onClick={openAdd}
                      style={{
                        padding: "10px 22px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <Plus size={15} /> Add First Video
                    </button>
                  </div>
                ) : (
                  <div
                    className="teacher-video-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: 14,
                    }}
                  >
                    {[...teacherVideos]
                      .reverse()
                      .slice(0, 6)
                      .map((v) => (
                        <VideoCard
                          key={v.id}
                          video={v}
                          lesson={lessons.find(
                            (l) => String(l.id) === String(v.lesson_id),
                          )}
                          onEdit={openEdit}
                          onDelete={(id) => setDeleteConfirm(id)}
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROJECT REQUESTS TAB */}
          {activeTab === "projects" && (
            <div className="teacher-content-section" style={{ padding: "24px 20px" }}>
              <div style={{ marginBottom: 20 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Project Requests
                </h1>
                <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>
                  Review student projects for your teaching major first, then send
                  approved requests to admin.
                </p>
              </div>

              {pendingProjects.length === 0 ? (
                <div
                  style={{
                    background: "#fff",
                    border: "2px dashed #e5e7eb",
                    borderRadius: "16px",
                    padding: "48px 20px",
                    textAlign: "center",
                  }}
                >
                  <ClipboardCheck size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
                  <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                    No pending project requests
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
                    Requests you approve move to admin for final publishing.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {pendingProjects.map((project) => (
                    <div
                      key={project.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "16px",
                        padding: "18px",
                        display: "flex",
                        gap: 14,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 84,
                          height: 64,
                          borderRadius: 12,
                          background: "#eef2ff",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {project.image || project.image_url ? (
                          <img
                            src={project.image || project.image_url}
                            alt={project.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <ClipboardCheck size={24} color="#6366f1" style={{ margin: 20 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 16, color: "#111827" }}>
                              {project.title}
                            </h3>
                            <p style={{ margin: "5px 0 10px", color: "#6b7280", fontSize: 13 }}>
                              {project.description || "No description"}
                            </p>
                            <p style={{ margin: "0 0 10px", color: "#6366f1", fontSize: 12, fontWeight: 700 }}>
                              Major: {getProjectMajor(project) || teacherMajor || "Not set"}
                            </p>
                          </div>
                          <span
                            style={{
                              height: "fit-content",
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: "#fffbeb",
                              color: "#92400e",
                              fontSize: 12,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Teacher review
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                          {normalizeProjectTags(project.tags)
                            .filter(
                              (tag) =>
                                tag !== TEACHER_APPROVED_TAG &&
                                !tag.startsWith(PROJECT_MAJOR_PREFIX),
                            )
                            .map((tag) => (
                            <span
                              key={tag}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 999,
                                background: "#f3f4f6",
                                color: "#4b5563",
                                fontSize: 12,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleApproveProject(project)}
                          style={{
                            border: "none",
                            borderRadius: 10,
                            background: "#10b981",
                            color: "#fff",
                            padding: "9px 14px",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <CheckCircle size={15} />
                          Send to Admin
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXAM QUESTIONS TAB */}
          {activeTab === "exam" && (
            <div className="teacher-content-section" style={{ padding: "24px 20px" }}>
              <div style={{ marginBottom: 20 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(18px, 5vw, 22px)",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Exam Questions
                </h1>
                <p
                  style={{
                    margin: "3px 0 0",
                    color: "#64748b",
                    fontSize: "13.5px",
                  }}
                >
                  Add questions to the student exam for your teaching major.
                </p>
              </div>
              <ExamQuestionForm
                user={user}
                defaultMajor={teacherMajor || "ITE"}
                lockMajor={Boolean(teacherMajor)}
                onQuestionsChange={setExamReportData}
              />
            </div>
          )}

          {/* ALL VIDEOS TAB */}
          {activeTab === "videos" && (
            <div className="teacher-content-section" style={{ padding: "24px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "clamp(18px, 5vw, 22px)",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    All Videos
                  </h1>
                  <p
                    style={{
                      margin: "3px 0 0",
                      color: "#64748b",
                      fontSize: "13.5px",
                    }}
                  >
                    {filteredVideos.length} video
                    {filteredVideos.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={openAdd}
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Plus size={14} /> Add Video
                </button>
              </div>

              {/* Filters */}
              <div
                className="teacher-filter-bar"
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 22,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ position: "relative", flex: 1, minWidth: "180px" }}
                >
                  <Search
                    size={15}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                    }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search videos…"
                    style={{
                      width: "100%",
                      padding: "9px 12px 9px 36px",
                      border: "1px solid #d1d5db",
                      borderRadius: "9px",
                      fontSize: "13.5px",
                      fontFamily: "'DM Sans', sans-serif",
                      background: "#fff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <select
                  value={filterLesson}
                  onChange={(e) => setFilterLesson(e.target.value)}
                  style={{
                    padding: "9px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "9px",
                    fontSize: "13.5px",
                    fontFamily: "'DM Sans', sans-serif",
                    background: "#fff",
                    color: "#374151",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="all">All lessons</option>
                  {filteredLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              {filteredVideos.length === 0 ? (
                <div
                  style={{
                    background: "#fff",
                    border: "2px dashed #e5e7eb",
                    borderRadius: "16px",
                    padding: "48px 20px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                    No videos found. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                <div
                  className="teacher-video-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 14,
                  }}
                >
                  {filteredVideos.map((v) => (
                    <VideoCard
                      key={v.id}
                      video={v}
                      lesson={lessons.find(
                        (l) => String(l.id) === String(v.lesson_id),
                      )}
                      onEdit={openEdit}
                      onDelete={(id) => setDeleteConfirm(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BY LESSON TAB */}
          {activeTab === "by-lesson" && (
            <div className="teacher-content-section" style={{ padding: "24px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "clamp(18px, 5vw, 22px)",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Videos by Lesson
                  </h1>
                  <p
                    style={{
                      margin: "3px 0 0",
                      color: "#64748b",
                      fontSize: "13.5px",
                    }}
                  >
                    Organized view of all lesson content
                  </p>
                </div>
                <button
                  onClick={openAdd}
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Plus size={14} /> Add Video
                </button>
              </div>

              {videosByLesson.length === 0 ? (
                <div
                  style={{
                    background: "#fff",
                    border: "2px dashed #e5e7eb",
                    borderRadius: "16px",
                    padding: "48px 20px",
                    textAlign: "center",
                  }}
                >
                  <BookOpen
                    size={40}
                    color="#d1d5db"
                    style={{ marginBottom: 12 }}
                  />
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                    No videos added yet. Add a video to a lesson to see it here.
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {videosByLesson.map(({ lesson, videos: lessonVideos }) => (
                    <div
                      key={lesson.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedLesson(
                            expandedLesson === lesson.id ? null : lesson.id,
                          )
                        }
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px 20px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          borderBottom:
                            expandedLesson === lesson.id
                              ? "1px solid #f3f4f6"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: lesson.color || "#6366f1",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              {lesson.title}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: "12px",
                                color: "#9ca3af",
                              }}
                            >
                              {lesson.category} · {lesson.level}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              background: "#eef2ff",
                              color: "#6366f1",
                              borderRadius: "20px",
                              padding: "3px 12px",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {lessonVideos.length} video
                            {lessonVideos.length !== 1 ? "s" : ""}
                          </span>
                          {expandedLesson === lesson.id ? (
                            <ChevronDown size={16} color="#9ca3af" />
                          ) : (
                            <ChevronRight size={16} color="#9ca3af" />
                          )}
                        </div>
                      </button>

                      {expandedLesson === lesson.id && (
                        <div style={{ padding: "16px 20px" }}>
                          <div
                            className="teacher-video-grid compact"
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(240px, 1fr))",
                              gap: 12,
                            }}
                          >
                            {lessonVideos.map((v) => (
                              <VideoCard
                                key={v.id}
                                video={v}
                                lesson={lesson}
                                onEdit={openEdit}
                                onDelete={(id) => setDeleteConfirm(id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LESSONS TAB */}
          {activeTab === "lessons" && (
            <div className="teacher-content-section" style={{ padding: "24px 20px" }}>
              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(18px, 5vw, 22px)",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Lessons
                </h1>
                <p
                  style={{
                    margin: "3px 0 0",
                    color: "#64748b",
                    fontSize: "13.5px",
                  }}
                >
                  All available lessons — click a lesson to add a video
                </p>
              </div>
              <div
                className="teacher-lessons-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {filteredLessons.map((lesson) => {
                  const count = teacherVideos.filter(
                    (v) => String(v.lesson_id) === String(lesson.id),
                  ).length;
                  return (
                    <div
                      key={lesson.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        padding: "18px 20px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "4px",
                          height: "100%",
                          background: lesson.color || "#6366f1",
                        }}
                      />
                      <div style={{ paddingLeft: 8 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#0f172a",
                              lineHeight: 1.3,
                              flex: 1,
                            }}
                          >
                            {lesson.title}
                          </p>
                          <span
                            style={{
                              background: count > 0 ? "#eef2ff" : "#f9fafb",
                              color: count > 0 ? "#6366f1" : "#9ca3af",
                              border: `1px solid ${count > 0 ? "#c7d2fe" : "#e5e7eb"}`,
                              borderRadius: "20px",
                              padding: "2px 10px",
                              fontSize: "11px",
                              fontWeight: 600,
                              flexShrink: 0,
                              marginLeft: 8,
                            }}
                          >
                            {count} video{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                            marginBottom: 14,
                          }}
                        >
                          {[lesson.category, lesson.semester, lesson.level].map(
                            (tag) =>
                              tag && (
                                <span
                                  key={tag}
                                  style={{
                                    background: "#f3f4f6",
                                    color: "#6b7280",
                                    borderRadius: "5px",
                                    padding: "2px 8px",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                  }}
                                >
                                  {tag}
                                </span>
                              ),
                          )}
                        </div>
                        <button
                          onClick={() => {
                            openAdd();
                          }}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "9px",
                            border: `1px dashed ${lesson.color || "#6366f1"}`,
                            background: "transparent",
                            color: lesson.color || "#6366f1",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            fontFamily: "'DM Sans', sans-serif",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f5f3ff")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <Plus size={13} /> Add Video
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="teacher-content-section" style={{ padding: "24px 20px" }}>
              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(18px, 5vw, 22px)",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Settings
                </h1>
                <p
                  style={{
                    margin: "3px 0 0",
                    color: "#64748b",
                    fontSize: "13.5px",
                  }}
                >
                  Manage your teacher account and dashboard preferences.
                </p>
              </div>

              <div
                className="teacher-settings-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)",
                  gap: 16,
                  alignItems: "start",
                }}
              >
                <section
                  className="teacher-settings-card"
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 22,
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "20px",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {(user?.name || "T")[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "17px",
                          fontWeight: 800,
                        }}
                      >
                        {user?.name || "Teacher"}
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          color: "#64748b",
                          fontSize: "13px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user?.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  {[
                    ["Full Name", user?.name || "Teacher"],
                    ["Email Address", user?.email || "Not set"],
                    ["Role", user?.role || "teacher"],
                    ["Teaching Major", teacherMajor || "Not assigned"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "150px minmax(0, 1fr)",
                        gap: 12,
                        padding: "12px 0",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "12px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          color: "#334155",
                          fontSize: "14px",
                          fontWeight: 600,
                          minWidth: 0,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </section>

                <section
                  className="teacher-settings-card"
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "22px",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: "#eef2ff",
                      color: "#6366f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Settings size={20} />
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Dashboard Actions
                  </h2>
                  <p
                    style={{
                      margin: "6px 0 18px",
                      color: "#64748b",
                      fontSize: "13.5px",
                      lineHeight: 1.6,
                    }}
                  >
                    Choose your display mode, refresh your data, or sign out of
                    the teacher dashboard.
                  </p>

                  <div style={{ marginBottom: 18 }}>
                    <p
                      style={{
                        margin: "0 0 10px",
                        color: "#334155",
                        fontSize: "13px",
                        fontWeight: 800,
                      }}
                    >
                      Appearance
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      {[
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                      ].map(({ id, label, icon: Icon }) => {
                        const active = themeMode === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleThemeChange(id)}
                            style={{
                              padding: "11px 10px",
                              borderRadius: "10px",
                              border: `1px solid ${active ? "#6366f1" : "#e5e7eb"}`,
                              background: active ? "#eef2ff" : "#fff",
                              color: active ? "#4f46e5" : "#475569",
                              fontSize: "13px",
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 7,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            <Icon size={15} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <button
                      type="button"
                      onClick={loadData}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid #dbeafe",
                        background: "#eff6ff",
                        color: "#2563eb",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <RefreshCw size={15} />
                      Refresh Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        border: "1px solid #fecaca",
                        background: "#fef2f2",
                        color: "#dc2626",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>

        {/* VIDEO FORM MODAL */}
        <VideoFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingVideo(null);
          }}
          onSave={handleSave}
          editingVideo={editingVideo}
          lessons={filteredLessons}
        />

        {/* DELETE CONFIRM */}
        {deleteConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteConfirm(null);
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "28px 32px",
                maxWidth: 360,
                width: "90%",
                textAlign: "center",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: "#fef2f2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Trash2 size={22} color="#ef4444" />
              </div>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Delete video?
              </p>
              <p
                style={{
                  margin: "0 0 22px",
                  fontSize: "13.5px",
                  color: "#6b7280",
                }}
              >
                This action cannot be undone.
              </p>
              <div
                style={{ display: "flex", gap: 10, justifyContent: "center" }}
              >
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .teacher-dashboard-root {
          --teacher-primary: #4f46e5;
          --teacher-primary-soft: #eef2ff;
          --teacher-border: #dbe5f1;
          --teacher-surface: rgba(255,255,255,0.94);
          --teacher-text: #0f172a;
          --teacher-muted: #64748b;
        }

        .teacher-main {
          scroll-behavior: smooth;
        }

        .teacher-content-section,
        .teacher-report-toolbar {
          width: min(100%, 1540px);
          margin-left: auto;
          margin-right: auto;
          box-sizing: border-box;
        }

        .teacher-content-section {
          padding: 14px 24px 40px !important;
          animation: slideUp 0.28s ease-out;
        }

        .teacher-report-toolbar {
          padding: 20px 24px 0 !important;
        }

        .teacher-report-toolbar button {
          min-height: 40px;
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .teacher-report-toolbar button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(79,70,229,0.3) !important;
          filter: saturate(1.08);
        }

        .teacher-content-section > div:first-child {
          position: relative;
          overflow: hidden;
          padding: 24px 26px !important;
          border: 1px solid var(--teacher-border);
          border-radius: 18px;
          background:
            radial-gradient(circle at 92% 12%, rgba(99,102,241,0.18), transparent 14rem),
            linear-gradient(135deg, rgba(255,255,255,0.98), rgba(245,247,255,0.94));
          box-shadow: 0 14px 38px rgba(15,23,42,0.07);
        }

        .teacher-content-section > div:first-child::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 4px;
          background: linear-gradient(180deg, #4f46e5, #8b5cf6);
        }

        .teacher-content-section > div:first-child h1 {
          font-size: clamp(22px, 2.4vw, 30px) !important;
          letter-spacing: -0.03em !important;
        }

        .teacher-stats-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          gap: 16px !important;
        }

        .teacher-stats-grid > div,
        .teacher-video-grid > div,
        .teacher-lessons-grid > div,
        .teacher-settings-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .teacher-stats-grid > div {
          min-height: 142px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: 18px !important;
        }

        .teacher-stats-grid > div:hover,
        .teacher-video-grid > div:hover,
        .teacher-lessons-grid > div:hover,
        .teacher-settings-card:hover {
          transform: translateY(-3px);
          border-color: rgba(99,102,241,0.42) !important;
          box-shadow: 0 20px 48px rgba(15,23,42,0.12) !important;
        }

        .teacher-video-grid {
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)) !important;
          gap: 18px !important;
          align-items: stretch;
        }

        .teacher-video-grid > div {
          height: 100%;
          border-radius: 18px !important;
          overflow: hidden;
        }

        .teacher-lessons-grid {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
          gap: 18px !important;
        }

        .teacher-lessons-grid > div,
        .teacher-settings-card {
          border-radius: 18px !important;
        }

        .teacher-filter-bar {
          padding: 14px;
          border: 1px solid var(--teacher-border);
          border-radius: 14px;
          background: var(--teacher-surface);
          box-shadow: 0 8px 24px rgba(15,23,42,0.05);
        }

        .teacher-filter-bar input,
        .teacher-filter-bar select {
          min-height: 42px;
        }

        .teacher-dashboard-root button:focus-visible,
        .teacher-dashboard-root input:focus-visible,
        .teacher-dashboard-root select:focus-visible,
        .teacher-dashboard-root textarea:focus-visible {
          outline: 3px solid rgba(99,102,241,0.22) !important;
          outline-offset: 2px;
        }

        html:not(.dark-mode) .teacher-dashboard-root .teacher-main {
          background:
            radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 34rem),
            linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%) !important;
          color: #0f172a !important;
        }

        html:not(.dark-mode) .teacher-dashboard-root .teacher-main h1,
        html:not(.dark-mode) .teacher-dashboard-root .teacher-main h2,
        html:not(.dark-mode) .teacher-dashboard-root .teacher-main h3 {
          color: #0f172a !important;
        }

        html:not(.dark-mode) .teacher-dashboard-root .teacher-main input,
        html:not(.dark-mode) .teacher-dashboard-root .teacher-main select,
        html:not(.dark-mode) .teacher-dashboard-root .teacher-main textarea {
          background: #ffffff !important;
          color: #0f172a !important;
          border-color: #d8e2f0 !important;
        }

        html:not(.dark-mode) .teacher-dashboard-root .teacher-stats-grid > div,
        html:not(.dark-mode) .teacher-dashboard-root .teacher-video-grid > div,
        html:not(.dark-mode) .teacher-dashboard-root .teacher-lessons-grid > div,
        html:not(.dark-mode) .teacher-dashboard-root .teacher-settings-card {
          background: rgba(255,255,255,0.94) !important;
          border-color: #d8e2f0 !important;
          color: #0f172a !important;
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08) !important;
        }

        html:not(.dark-mode) .teacher-dashboard-root .sidebar {
          background: rgba(255,255,255,0.96) !important;
          border-right: 1px solid #d8e2f0 !important;
          box-shadow: 12px 0 34px rgba(15,23,42,0.06);
        }

        html:not(.dark-mode) .teacher-dashboard-root .sidebar p {
          color: #0f172a !important;
        }

        html:not(.dark-mode) .teacher-dashboard-root .sidebar button {
          color: #475569 !important;
        }

        html:not(.dark-mode) .teacher-dashboard-root .sidebar button[style*="linear-gradient"] {
          color: #ffffff !important;
        }

        html.dark-mode .teacher-main {
          background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.20), transparent 30rem),
            linear-gradient(180deg, #070816 0%, #10122a 100%) !important;
          color: #f4f7ff !important;
        }

        html.dark-mode .teacher-main h1,
        html.dark-mode .teacher-main h2,
        html.dark-mode .teacher-main h3 {
          color: #f4f7ff !important;
        }

        html.dark-mode .teacher-dashboard-root .sidebar {
          background:
            linear-gradient(180deg, rgba(13, 16, 36, 0.98), rgba(16, 18, 42, 0.98)) !important;
          border-right: 1px solid #2b315f !important;
        }

        html.dark-mode .teacher-dashboard-root .sidebar button {
          color: #a8b1d6 !important;
        }

        html.dark-mode .teacher-dashboard-root .sidebar button:hover {
          background: rgba(99, 102, 241, 0.14) !important;
          color: #f4f7ff !important;
        }

        html.dark-mode .teacher-dashboard-root .sidebar button[style*="rgba(99,102,241,0.15)"] {
          background: rgba(99, 102, 241, 0.22) !important;
          color: #c7d2fe !important;
        }

        html.dark-mode .teacher-settings-card,
        html.dark-mode .teacher-stats-grid > div,
        html.dark-mode .teacher-video-grid > div,
        html.dark-mode .teacher-lessons-grid > div {
          background: rgba(21, 23, 51, 0.96) !important;
          border-color: #2b315f !important;
          color: #f4f7ff !important;
          box-shadow: 0 20px 54px rgba(0, 0, 0, 0.42) !important;
        }

        html.dark-mode .teacher-dashboard-root {
          --teacher-border: #2b315f;
          --teacher-surface: rgba(21,23,51,0.96);
          --teacher-text: #f4f7ff;
          --teacher-muted: #a8b1d6;
        }

        html.dark-mode .teacher-content-section > div:first-child {
          background:
            radial-gradient(circle at 92% 12%, rgba(129,140,248,0.22), transparent 14rem),
            linear-gradient(135deg, rgba(21,23,51,0.98), rgba(28,31,66,0.94)) !important;
          border-color: #2b315f !important;
          box-shadow: 0 18px 48px rgba(0,0,0,0.34) !important;
        }

        html.dark-mode .teacher-filter-bar {
          background: rgba(21,23,51,0.96) !important;
          border-color: #2b315f !important;
          box-shadow: 0 14px 34px rgba(0,0,0,0.22);
        }

        html.dark-mode .teacher-settings-card button:not([style*="linear-gradient"]) {
          background-color: #10142e !important;
          border-color: #2b315f !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-main input,
        html.dark-mode .teacher-dashboard-root .teacher-main select,
        html.dark-mode .teacher-dashboard-root .teacher-main textarea {
          background: #10142e !important;
          color: #f4f7ff !important;
          border-color: #2b315f !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-main div[style*="background: rgb(255, 255, 255)"],
        html.dark-mode .teacher-dashboard-root .teacher-main div[style*="background: #fff"],
        html.dark-mode .teacher-dashboard-root .teacher-main article[style*="background: rgb(255, 255, 255)"],
        html.dark-mode .teacher-dashboard-root .teacher-main article[style*="background: #fff"],
        html.dark-mode .teacher-dashboard-root .teacher-main section[style*="background: rgb(255, 255, 255)"],
        html.dark-mode .teacher-dashboard-root .teacher-main section[style*="background: #fff"] {
          background: rgba(21, 23, 51, 0.96) !important;
          border-color: #2b315f !important;
          color: #f4f7ff !important;
          box-shadow: 0 20px 54px rgba(0, 0, 0, 0.42) !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-main div[style*="background: rgb(249, 250, 251)"],
        html.dark-mode .teacher-dashboard-root .teacher-main div[style*="background: #f9fafb"],
        html.dark-mode .teacher-dashboard-root .teacher-main div[style*="background: rgb(243, 244, 246)"],
        html.dark-mode .teacher-dashboard-root .teacher-main div[style*="background: #f3f4f6"],
        html.dark-mode .teacher-dashboard-root .teacher-main button[style*="background: rgb(243, 244, 246)"],
        html.dark-mode .teacher-dashboard-root .teacher-main button[style*="background: #f3f4f6"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="background: rgb(243, 244, 246)"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="background: #f3f4f6"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="background: rgb(238, 242, 255)"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="background: #eef2ff"] {
          background: #10142e !important;
          border-color: #2b315f !important;
          color: #d7def7 !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-lessons-grid > div {
          background:
            linear-gradient(145deg, rgba(21, 23, 51, 0.98), rgba(28, 31, 66, 0.94)) !important;
          border: 1px solid rgba(129, 140, 248, 0.28) !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-lessons-grid > div:hover {
          border-color: rgba(165, 180, 252, 0.48) !important;
          box-shadow: 0 20px 46px rgba(79, 70, 229, 0.18) !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-lessons-grid button,
        html.dark-mode .teacher-dashboard-root [class*="teacher-video-grid"] button {
          color: #f4f7ff !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-main [style*="color: rgb(99, 102, 241)"],
        html.dark-mode .teacher-dashboard-root .teacher-main [style*="color: #6366f1"] {
          color: #c7d2fe !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-main h1[style*="color"],
        html.dark-mode .teacher-dashboard-root .teacher-main h2[style*="color"],
        html.dark-mode .teacher-dashboard-root .teacher-main h3[style*="color"],
        html.dark-mode .teacher-dashboard-root .teacher-main p[style*="color: rgb(17, 24, 39)"],
        html.dark-mode .teacher-dashboard-root .teacher-main p[style*="color: #111827"],
        html.dark-mode .teacher-dashboard-root .teacher-main p[style*="color: rgb(15, 23, 42)"],
        html.dark-mode .teacher-dashboard-root .teacher-main p[style*="color: #0f172a"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="color: rgb(17, 24, 39)"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="color: #111827"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="color: rgb(15, 23, 42)"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="color: #0f172a"] {
          color: #f4f7ff !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-main p[style*="color: rgb(107, 114, 128)"],
        html.dark-mode .teacher-dashboard-root .teacher-main p[style*="color: #6b7280"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="color: rgb(107, 114, 128)"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="color: #6b7280"],
        html.dark-mode .teacher-dashboard-root .teacher-main p[style*="color: rgb(156, 163, 175)"],
        html.dark-mode .teacher-dashboard-root .teacher-main p[style*="color: #9ca3af"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="color: rgb(156, 163, 175)"],
        html.dark-mode .teacher-dashboard-root .teacher-main span[style*="color: #9ca3af"] {
          color: #a8b1d6 !important;
        }

        html.dark-mode .teacher-dashboard-root .teacher-main [style*="border: 1px solid rgb(229, 231, 235)"],
        html.dark-mode .teacher-dashboard-root .teacher-main [style*="border: 1px solid #e5e7eb"] {
          border-color: #2b315f !important;
        }

        html:not(.dark-mode) .teacher-dashboard-root .teacher-main div[style*="background: rgb(15, 23, 42)"],
        html:not(.dark-mode) .teacher-dashboard-root .teacher-main div[style*="background: #0f172a"],
        html:not(.dark-mode) .teacher-dashboard-root .teacher-main div[style*="background: rgb(17, 24, 39)"],
        html:not(.dark-mode) .teacher-dashboard-root .teacher-main div[style*="background: #111827"] {
          background: rgba(255, 255, 255, 0.96) !important;
          border-color: #d8e2f0 !important;
          color: #0f172a !important;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            z-index: 30 !important;
            transition: left 0.25s ease, background 0.2s ease;
          }
          .mobile-menu-button.is-open {
            left: 208px !important;
            background: #1e293b !important;
            box-shadow: 0 6px 18px rgba(0,0,0,0.22) !important;
          }
          .mobile-overlay {
            display: none !important;
          }
          .mobile-overlay.is-open {
            display: block !important;
          }
          .teacher-main {
            padding-top: 54px;
          }
          .teacher-content-section {
            padding: 12px 18px 28px !important;
          }
          .teacher-report-toolbar {
            padding: 14px 18px 0 !important;
          }
          .teacher-content-section > div:first-child {
            padding: 20px !important;
          }
          .sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 25 !important;
            transform: translateX(-100%) !important;
            box-shadow: 2px 0 8px rgba(0,0,0,0.1);
          }
          .sidebar.is-open {
            transform: translateX(0) !important;
          }
          .teacher-video-grid,
          .teacher-lessons-grid,
          .teacher-settings-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 560px) {
          .teacher-content-section {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .teacher-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
          .teacher-stats-grid > div {
            min-height: 126px;
            padding: 15px !important;
          }
          .teacher-report-toolbar button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (min-width: 769px) and (max-width: 1280px) {
          .teacher-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 380px) {
          .mobile-menu-button.is-open {
            left: calc(100vw - 56px) !important;
          }
          .teacher-content-section {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }
          .teacher-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default TeacherDashboard;
