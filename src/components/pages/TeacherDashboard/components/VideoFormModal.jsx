import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  Youtube,
} from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl } from "../dashboardUtils";

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

export default VideoFormModal;
