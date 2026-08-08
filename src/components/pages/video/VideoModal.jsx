import React, { useEffect, useState } from "react";
import { X, PlayCircle, AlertCircle } from "lucide-react";

const VideoModal = ({ isOpen, onClose, videoLink, videoTitle }) => {
  const [embedError, setEmbedError] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(null);

  // Extract YouTube embed URL from various YouTube URL formats
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      }
    }

    // If it's already an embed URL, return as is
    if (url.includes("/embed/")) {
      return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }

    return null;
  };

  // Update embed URL when videoLink changes
  useEffect(() => {
    if (videoLink && isOpen) {
      const url = getYouTubeEmbedUrl(videoLink);
      setEmbedUrl(url);
      setEmbedError(!url);
    } else {
      setEmbedUrl(null);
      setEmbedError(false);
    }
  }, [videoLink, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ animation: "vmFadeIn 0.25s ease-out both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes vmFadeIn {
            from { 
              opacity: 0; 
              transform: scale(0.95) translateY(12px); 
            }
            to { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
            }
          }
          @keyframes vmSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-base line-clamp-1">
                {videoTitle || "Video Lesson"}
              </span>
              <span className="text-white/40 text-xs block mt-0.5">
                Educational Content
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Video Player Area */}
        <div
          className="relative w-full bg-black"
          style={{ minHeight: "400px" }}
        >
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {embedError ? (
              // Error state - invalid YouTube URL
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 bg-gray-900">
                <AlertCircle className="h-16 w-16 mb-4 text-red-500/50" />
                <p className="text-lg font-medium mb-2 text-white/80">
                  Unable to load video
                </p>
                <p className="text-sm text-white/40 text-center max-w-md px-4">
                  The video link appears to be invalid or unsupported. Please
                  check the URL and try again.
                </p>
                <p className="text-xs text-white/30 mt-4">
                  Supported formats: YouTube, YouTube Shorts
                </p>
              </div>
            ) : embedUrl ? (
              // Loading state
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-white/60 text-sm">Loading video...</p>
                </div>
              </div>
            ) : null}

            {embedUrl && !embedError && (
              <iframe
                src={embedUrl}
                title={videoTitle || "Video Lesson"}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setEmbedError(true)}
                onLoad={() => {
                  // Hide loading state when iframe loads
                  const loader = document.querySelector(".video-loader");
                  if (loader) loader.style.display = "none";
                }}
              />
            )}

            {!embedUrl && !embedError && (
              // No video link provided
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 bg-gray-900">
                <PlayCircle className="h-20 w-20 mb-4 opacity-30" />
                <p className="text-base font-medium text-white/60">
                  No video available
                </p>
                <p className="text-sm text-white/30 mt-2">
                  This lesson doesn't have a video yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with helpful info */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between text-xs text-white/40">
            <div className="flex items-center gap-4">
              <span>🎓 Educational purposes only</span>
              <span>🔒 Secure playback</span>
            </div>
            <button
              onClick={onClose}
              className="hover:text-white/80 transition-colors"
            >
              Press ESC to close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
