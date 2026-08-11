import React, { useEffect, useRef, useState } from "react";
import "./videoFormModal.css";
import {
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  Youtube,
} from "lucide-react";
import { extractYouTubeId, normalizeYouTubeUrl } from "../dashboardUtils";

let youtubeApiPromise;
const loadYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
};

const VideoFormModal = ({ isOpen, onClose, onSave, editingVideo, lessons, selectedLessonId, teacherId }) => {
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
  const [durationStatus, setDurationStatus] = useState("");
  const [previewError, setPreviewError] = useState("");
  const playerHostRef = useRef(null);
  const playerRef = useRef(null);

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
        lesson_id: selectedLessonId || "",
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
    setPreviewError("");
  }, [editingVideo, isOpen, selectedLessonId]);

  useEffect(() => {
    if (!isOpen || !preview || !playerHostRef.current) return undefined;
    let cancelled = false;
    let activeHost = null;
    setPreviewError("");
    setDurationStatus("Detecting duration…");
    loadYouTubeApi().then((YT) => {
      if (cancelled || !playerHostRef.current) return;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // The iframe may already have been removed by a modal re-render.
      }

      const host = playerHostRef.current;
      activeHost = host;
      host.replaceChildren();
      const playerMount = document.createElement("div");
      host.appendChild(playerMount);

      playerRef.current = new YT.Player(playerMount, {
        videoId: preview,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: (event) => {
            const seconds = event.target.getDuration();
            if (seconds > 0) {
              const minutes = Math.max(1, Math.ceil(seconds / 60));
              setForm((current) => ({ ...current, duration_minutes: minutes }));
              setDurationStatus(`Detected ${minutes} minute${minutes === 1 ? "" : "s"}`);
            } else {
              setDurationStatus("Enter duration manually");
            }
          },
          onError: () => {
            setPreviewError(
              "This video cannot be played inside the dashboard. You can still save and open it on YouTube.",
            );
            setDurationStatus("Could not detect duration; enter it manually");
          },
        },
      });
    });
    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // Safe cleanup when YouTube has already replaced/removed its iframe.
      }
      playerRef.current = null;
      activeHost?.replaceChildren();
    };
  }, [isOpen, preview]);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));

    if (field === "link") {
      const id = extractYouTubeId(value);
      setPreviewError("");
      setPreview(id || null);
    }
  };

  const handleLinkPaste = (event) => {
    const pastedValue = event.clipboardData.getData("text").trim();
    const videoId = extractYouTubeId(pastedValue);
    if (!videoId) return;

    event.preventDefault();
    const normalizedUrl = normalizeYouTubeUrl(pastedValue);
    setForm((current) => ({ ...current, link: normalizedUrl }));
    setErrors((current) => ({ ...current, link: null }));
    setPreviewError("");
    setPreview(videoId);
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
        teacher_id: teacherId,
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
      className="video-form-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
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
        className="video-form-modal"
        style={{
          borderRadius: "20px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflow: "auto",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          className="video-form-modal-header"
          style={{
            padding: "22px 28px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
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
                className="video-form-modal-title"
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
            className="video-form-modal-close"
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
            <label className="video-form-label" style={labelStyle}>Lesson *</label>
            {selectedLessonId && !editingVideo ? (
              <div className="video-form-readonly" style={{ ...inputStyle("lesson_id"), color: "#374151", background: "#eef2ff" }}>
                {lessons.find((lesson) => String(lesson.id) === String(selectedLessonId))?.title || `Lesson #${selectedLessonId}`}
              </div>
            ) : (
              <select className="video-form-field" value={form.lesson_id} onChange={(e) => handleChange("lesson_id", e.target.value)} style={{ ...inputStyle("lesson_id"), cursor: "pointer" }}>
                <option value="">— Select a lesson by title —</option>
                {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
              </select>
            )}
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
            <label className="video-form-label" style={labelStyle}>Video Title *</label>
            <input
              className="video-form-field"
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
            <label className="video-form-label" style={labelStyle}>YouTube URL *</label>
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
                className="video-form-field"
                type="url"
                value={form.link}
                onChange={(e) => handleChange("link", e.target.value)}
                onPaste={handleLinkPaste}
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
              <div className="video-form-player" style={{ position: "relative", paddingTop: "56.25%" }}>
                {previewError ? (
                  <div className="video-form-preview-fallback">
                    <Youtube size={38} />
                    <strong>Preview unavailable</strong>
                    <span>{previewError}</span>
                    <a
                      href={normalizeYouTubeUrl(form.link)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on YouTube
                    </a>
                  </div>
                ) : (
                  <div
                    ref={playerHostRef}
                    className="video-form-player-host"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                )}
              </div>
              <div
                className="video-form-preview-status"
                style={{
                  padding: "8px 12px",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CheckCircle size={14} color={previewError ? "#f59e0b" : "#10b981"} />
                <span
                  style={{
                    fontSize: "12px",
                    color: previewError ? "#f59e0b" : "#10b981",
                    fontWeight: 600,
                  }}
                >
                  {previewError ? "Valid link — external playback required" : "Valid YouTube video detected"}
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
              <label className="video-form-label" style={labelStyle}>Duration (minutes)</label>
              <input
                className="video-form-field"
                type="number"
                min="1"
                value={form.duration_minutes}
                onChange={(e) =>
                  handleChange("duration_minutes", e.target.value)
                }
                placeholder="e.g. 15"
                style={inputStyle("duration_minutes")}
              />
              {durationStatus && !errors.duration_minutes && <p style={{ color: "#6366f1", fontSize: "12px", margin: "4px 0 0" }}>{durationStatus}</p>}
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
              <label className="video-form-label" style={labelStyle}>Order Index *</label>
              <input
                className="video-form-field"
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
            <label className="video-form-label" style={labelStyle}>Description</label>
            <textarea
              className="video-form-field"
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
            className="video-form-access-panel"
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
                className="video-form-access-title"
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
              className={`video-form-toggle ${form.is_free ? "is-active" : ""}`}
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
              className="video-form-cancel"
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
