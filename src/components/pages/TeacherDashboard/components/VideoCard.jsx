import React from "react";
import {
  BookOpen,
  Clock,
  Edit3,
  ExternalLink,
  Play,
  Trash2,
  Youtube,
} from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnail } from "../dashboardUtils";

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

export default VideoCard;
