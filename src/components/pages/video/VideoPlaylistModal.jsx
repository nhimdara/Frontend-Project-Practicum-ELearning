import React, { useState, useEffect } from "react";
import { X, PlayCircle, Clock, ChevronRight, ListVideo, Lock } from "lucide-react";
import "./studentVideoModals.css";

const FREE_VIDEO_LIMIT = 2;

const VideoPlaylistModal = ({
  isOpen,
  onClose,
  videos = [],
  lessonTitle = "",
  onSelectVideo,
  isSubscribed = false,
  onSubscribeRequest,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalMinutes = videos.reduce((total, video) => {
    const duration = Number(video.duration ?? video.duration_minutes ?? 30);
    return total + (Number.isFinite(duration) && duration > 0 ? duration : 0);
  }, 0);

  function handleVideoClick(video, idx) {
    const isLocked = !isSubscribed && idx >= FREE_VIDEO_LIMIT;
    if (isLocked) {
      if (onSubscribeRequest) onSubscribeRequest();
      return;
    }
    onSelectVideo(video);
  }

  return (
    <div
      className="student-video-overlay fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.80)" }}
      onClick={onClose}
    >
      <div
        className="student-playlist-modal relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: "plFadeIn 0.25s ease-out both", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes plFadeIn {
            from { opacity:0; transform:scale(0.95) translateY(12px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          .playlist-scroll::-webkit-scrollbar { width:4px; }
          .playlist-scroll::-webkit-scrollbar-track { background:transparent; }
          .playlist-scroll::-webkit-scrollbar-thumb { background:#e0e0e0; border-radius:4px; }
        `}</style>

        {/* Header */}
        <div className="student-playlist-header bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                <ListVideo className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">
                  Video Playlist
                </p>
                <h2 className="text-white font-bold text-base leading-snug line-clamp-2">
                  {lessonTitle}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <PlayCircle className="h-3.5 w-3.5" />
              <span>{videos.length} video{videos.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalMinutes} min total</span>
            </div>
            {!isSubscribed && (
              <div className="ml-auto flex items-center gap-1 text-amber-300 text-xs font-medium">
                <Lock className="h-3 w-3" />
                <span>{FREE_VIDEO_LIMIT} free</span>
              </div>
            )}
          </div>
        </div>

        {/* Free preview note */}
        {!isSubscribed && (
          <div className="student-playlist-notice border-b px-5 py-2.5 flex items-center justify-between gap-3">
            <p className="student-playlist-notice-text text-xs">
              First <strong>{FREE_VIDEO_LIMIT} videos</strong> are free. Subscribe to unlock all.
            </p>
            {onSubscribeRequest && (
              <button
                onClick={onSubscribeRequest}
                className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Subscribe →
              </button>
            )}
          </div>
        )}

        {/* Video list */}
        <div className="student-playlist-list playlist-scroll overflow-y-auto" style={{ maxHeight: "380px" }}>
          {videos.map((video, idx) => {
            const isLocked = !isSubscribed && idx >= FREE_VIDEO_LIMIT;
            const isHovered = hoveredIdx === idx;

            return (
              <button
                key={video.id || idx}
                onClick={() => handleVideoClick(video, idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`student-playlist-row ${isLocked ? "is-locked" : ""} w-full text-left px-5 py-4 flex items-center gap-4 border-b transition-all duration-200 ${
                  isLocked
                    ? "cursor-pointer"
                    : "cursor-pointer"
                }`}
              >
                {/* Index / play button */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isLocked
                      ? "bg-gray-100"
                      : isHovered
                        ? "bg-indigo-600 scale-110"
                        : "bg-indigo-50"
                  }`}
                >
                  {isLocked ? (
                    <Lock className="h-4 w-4 text-gray-400" />
                  ) : isHovered ? (
                    <PlayCircle className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-sm font-bold text-indigo-600">{idx + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`student-playlist-title font-semibold text-sm truncate transition-colors ${
                    isLocked ? "text-gray-400" : isHovered ? "text-indigo-700" : "text-gray-800"
                  }`}>
                    {video.title}
                    {isLocked && (
                      <span className="ml-1.5 text-xs text-amber-500 font-medium">🔒 Premium</span>
                    )}
                  </div>
                  {video.description && (
                    <p className="student-playlist-description text-xs text-gray-400 truncate mt-0.5">{video.description}</p>
                  )}
                </div>

                {/* Duration + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="student-playlist-duration flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{video.duration ?? video.duration_minutes ?? 30}m</span>
                  </div>
                  {!isLocked && (
                    <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
                      isHovered ? "text-indigo-500 translate-x-0.5" : "text-gray-300"
                    }`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="student-playlist-footer px-5 py-4 border-t flex items-center justify-between gap-3">
          <p className="student-playlist-footer-text text-xs">Click any unlocked video to play</p>
          <button
            onClick={onClose}
            className="student-playlist-close px-4 py-2 text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlaylistModal;
