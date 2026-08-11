// pages/LessonsPage.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Star,
  Users,
  Filter,
  Search,
  ChevronDown,
  GraduationCap,
  Calendar,
  ListVideo,
  Film,
  Layers,
  Lock,
  Loader2,
  CreditCard,
  User,
  Mail,
} from "lucide-react";
import ScrollToTopButton from "../layout/ui/ScrollToTopButton";
import lessonImage from "./../assets/image/lessonpage.jpeg";
import VideoModal from "./video/VideoModal";
import VideoPlaylistModal from "./video/VideoPlaylistModal";

// ─── API ────────────────────────────────────────────────────
const API_BASE = API_BASE_URL;

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
      Number(a.order_index || 1) - Number(b.order_index || 1) ||
      Number(a.id) - Number(b.id),
  );
}

async function fetchLessons(major, academicYear) {
  const params = new URLSearchParams();
  if (major) params.set("major", major);
  if (academicYear) params.set("year_id", academicYear);

  const lessonsUrl =
    params.size > 0
      ? `${API_BASE}/lessons/filter?${params.toString()}`
      : `${API_BASE}/lessons`;

  const [lessonsRes, videosRes] = await Promise.all([
    fetch(lessonsUrl),
    fetch(`${API_BASE}/videos`),
  ]);
  const lessonsData = await lessonsRes.json();
  const videosData = await videosRes.json();

  // Attach videos array to each lesson
  return lessonsData.map((lesson) => ({
    ...lesson,
    videos: dedupeVideosByLessonSlot(
      videosData.filter((v) => v.lesson_id === lesson.id),
    ),
  }));
}
// ────────────────────────────────────────────────────────────

// Constants
const FREE_VIDEO_LIMIT = 2;

// Group lessons by year + semester
const buildSemesters = (lessons) => {
  const map = {};
  lessons.forEach((l) => {
    const key = l.semester || "Year 1 Semester 1";
    if (!map[key]) map[key] = [];
    map[key].push(l);
  });

  const order = [];
  for (let y = 1; y <= 4; y++) {
    for (let s = 1; s <= 2; s++) {
      order.push(`Year ${y} Semester ${s}`);
    }
  }

  return order.filter((k) => map[k]).map((k) => ({ label: k, items: map[k] }));
};

// Semester glass accent hues (used as the tinted glow behind each glass header)
const SEMESTER_STYLES = [
  { rgb: "99,102,241", text: "text-indigo-600", dot: "bg-indigo-500" },
  { rgb: "6,182,212", text: "text-cyan-600", dot: "bg-cyan-500" },
  { rgb: "16,185,129", text: "text-emerald-600", dot: "bg-emerald-500" },
  { rgb: "245,158,11", text: "text-amber-600", dot: "bg-amber-500" },
  { rgb: "244,63,94", text: "text-rose-600", dot: "bg-rose-500" },
  { rgb: "168,85,247", text: "text-violet-600", dot: "bg-violet-500" },
  { rgb: "14,165,233", text: "text-sky-600", dot: "bg-sky-500" },
  { rgb: "217,70,239", text: "text-fuchsia-600", dot: "bg-fuchsia-500" },
];

// Video Count Badge Component
const VideoCountBadge = ({ count }) => {
  if (!count) return null;
  return (
    <div className="lg-pill absolute top-4 left-16 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white">
      <Film className="h-3 w-3" />
      {count} {count === 1 ? "Video" : "Videos"}
    </div>
  );
};

// Enhanced Subscription Modal Component with form inputs
const SubscriptionModal = ({ onClose, onSubscribe }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Format: MM/YY";
    }
    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onSubscribe();
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s/g, "").replace(/\D/g, "").slice(0, 16);
    return v.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    return v;
  };

  return (
    <div
      className="lg-modal-overlay fixed inset-0 z-[120] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="lg-modal relative w-full max-w-md overflow-hidden animate-fadeInUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ambient glass glow blobs */}
        <div className="lg-orb" style={{ top: -60, left: -40, background: "rgba(99,102,241,0.55)" }} />
        <div className="lg-orb" style={{ bottom: -70, right: -50, background: "rgba(217,70,239,0.4)" }} />

        <div className="relative px-8 pt-9 pb-7 text-center">
          <button
            onClick={onClose}
            className="lg-modal-close absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            aria-label="Close subscription dialog"
          >
            ✕
          </button>
          <div className="lg-lock-badge mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Lock className="h-5 w-5" />
          </div>
          <h2 id="subscription-title" className="lg-modal-title text-2xl font-bold tracking-tight mb-1">Unlock Full Access</h2>
          <p className="lg-modal-subtitle text-sm font-medium">
            Get unlimited access to all {FREE_VIDEO_LIMIT}+ videos
          </p>
          <div className="mt-4 inline-flex items-baseline gap-1 lg-pill px-5 py-2">
            <span className="lg-modal-title text-2xl font-extrabold">$9.99</span>
            <span className="lg-modal-subtitle text-sm font-medium">/month</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative px-6 pb-6">
          <div className="lg-sheet rounded-[26px] p-5 space-y-4">
            {/* Full Name */}
            <div>
              <label className="lg-form-label block text-xs font-bold mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="lg-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="sok chea"
                  className={`lg-input w-full pl-10 pr-3 py-2.5 ${
                    errors.fullName ? "border-rose-400/70" : ""
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-rose-300 text-xs mt-1 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="lg-form-label block text-xs font-bold mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="lg-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="sokchea@example.com"
                  className={`lg-input w-full pl-10 pr-3 py-2.5 ${
                    errors.email ? "border-rose-400/70" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-rose-300 text-xs mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Card Number */}
            <div>
              <label className="lg-form-label block text-xs font-bold mb-1.5 uppercase tracking-wider">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="lg-input-icon absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" />
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    handleInputChange(
                      "cardNumber",
                      formatCardNumber(e.target.value),
                    )
                  }
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className={`lg-input w-full pl-10 pr-3 py-2.5 ${
                    errors.cardNumber ? "border-rose-400/70" : ""
                  }`}
                />
              </div>
              {errors.cardNumber && (
                <p className="text-rose-300 text-xs mt-1 font-medium">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiry Date & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="lg-form-label block text-xs font-bold mb-1.5 uppercase tracking-wider">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    handleInputChange(
                      "expiryDate",
                      formatExpiryDate(e.target.value),
                    )
                  }
                  placeholder="MM/YY"
                  maxLength="5"
                  className={`lg-input w-full px-3.5 py-2.5 ${
                    errors.expiryDate ? "border-rose-400/70" : ""
                  }`}
                />
                {errors.expiryDate && (
                  <p className="text-rose-300 text-xs mt-1 font-medium">
                    {errors.expiryDate}
                  </p>
                )}
              </div>
              <div>
                <label className="lg-form-label block text-xs font-bold mb-1.5 uppercase tracking-wider">
                  CVV
                </label>
                <input
                  type="password"
                  value={formData.cvv}
                  onChange={(e) =>
                    handleInputChange(
                      "cvv",
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  placeholder="123"
                  maxLength="4"
                  className={`lg-input w-full px-3.5 py-2.5 ${
                    errors.cvv ? "border-rose-400/70" : ""
                  }`}
                />
                {errors.cvv && (
                  <p className="text-rose-300 text-xs mt-1 font-medium">{errors.cvv}</p>
                )}
              </div>
            </div>

            {/* Secure Badge */}
            <div className="lg-form-helper flex items-center justify-center gap-2 text-xs font-medium mt-1">
              <Lock className="h-3 w-3" />
              Secure 256-bit SSL encryption
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="lg-cta-button w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Subscribe Now →"
              )}
            </button>

            <p className="lg-form-legal text-center text-[11px] leading-relaxed font-medium">
              By subscribing, you agree to our Terms of Service and Privacy
              Policy. You can cancel anytime.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lesson Card Component (same as before)
const LessonCard = ({ lesson, isSubscribed, onSubscribeRequest }) => {
  const [hovered, setHovered] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const hasVideos = lesson.videos && lesson.videos.length > 0;
  const videoCount = hasVideos ? lesson.videos.length : 0;
  const cardGradient = lesson.color || "from-indigo-500 to-purple-600";

  const handlePlayVideo = () => {
    if (videoCount > 1) {
      setShowPlaylist(true);
    } else if (videoCount === 1) {
      if (!isSubscribed && 1 > FREE_VIDEO_LIMIT) {
        onSubscribeRequest();
        return;
      }
      setSelectedVideo(lesson.videos[0]);
      setIsVideoModalOpen(true);
    } else if (lesson.videoLink) {
      if (!isSubscribed && 1 > FREE_VIDEO_LIMIT) {
        onSubscribeRequest();
        return;
      }
      setSelectedVideo({
        title: lesson.videoTitle || lesson.title,
        link: lesson.videoLink,
        duration: lesson.videoDuration || 30,
      });
      setIsVideoModalOpen(true);
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
    setShowPlaylist(false);
  };

  const isDark = document.documentElement.classList.contains("dark-mode");

  return (
    <>
      <div
        className={`lg-card group relative overflow-hidden ${isDark ? "lg-card-dark" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* specular sheen sweep */}
        <div className={`lg-sheen ${hovered ? "lg-sheen-active" : ""}`} />

        {/* Card Header */}
        <div
          className={`relative h-44 bg-gradient-to-br ${cardGradient} overflow-hidden cursor-pointer`}
          onClick={handlePlayVideo}
        >
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ${hovered ? "opacity-50" : "opacity-0"}`}
          />

          <div className="absolute top-4 right-4 z-10">
            <span className="lg-pill px-3.5 py-1.5 text-white text-[11px] font-bold">
              {lesson.category}
            </span>
          </div>

          {(hasVideos || lesson.videoLink) && (
            <VideoCountBadge count={videoCount || 1} />
          )}

          <div className="absolute bottom-4 left-4 right-4 z-10">
            <h3 className="text-lg font-bold text-white mb-1.5 drop-shadow-md tracking-tight">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-4 text-white/90 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.credit} credits
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                {lesson.rating}
              </span>
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
          >
            <div className="lg-play-orb flex items-center justify-center h-16 w-16">
              {videoCount > 1 ? (
                <Layers className="h-7 w-7 text-white" />
              ) : (
                <PlayCircle className="h-7 w-7 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                lesson.level === "Beginner"
                  ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/20"
                  : lesson.level === "Intermediate"
                    ? "bg-amber-500/12 text-amber-600 border border-amber-500/20"
                    : "bg-rose-500/12 text-rose-600 border border-rose-500/20"
              }`}
            >
              {lesson.level}
            </span>
            <span
              className={`flex items-center text-xs font-semibold ${isDark ? "text-indigo-300/70" : "text-gray-400"}`}
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              {lesson.students?.toLocaleString() || "0"}
            </span>
          </div>

          <p
            className={`text-sm mb-4 line-clamp-2 leading-relaxed font-medium ${isDark ? "text-indigo-200/60" : "text-gray-500"}`}
          >
            {lesson.description}
          </p>

          {videoCount > 1 && (
            <div className="mb-4">
              <div className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
                <ListVideo className="h-3 w-3" /> Playlist
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lesson.videos.slice(0, 3).map((v, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-black/[0.04] text-gray-600 border border-black/[0.06] font-medium"
                  >
                    {i + 1}. {v.title.substring(0, 12)}…
                  </span>
                ))}
                {videoCount > 3 && (
                  <span className="text-xs bg-black/[0.04] text-gray-600 border border-black/[0.06] px-2.5 py-1 rounded-full font-medium">
                    +{videoCount - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handlePlayVideo}
            className="lg-btn-secondary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold"
          >
            <span>
              {videoCount > 1
                ? `View ${videoCount} Videos`
                : hasVideos || lesson.videoLink
                  ? "Watch Video"
                  : "Start Learning"}
            </span>
            {videoCount > 1 ? (
              <Layers className="h-4 w-4" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedVideo(null);
        }}
        videoLink={selectedVideo?.link}
        videoTitle={selectedVideo?.title}
      />
      {showPlaylist && (
        <VideoPlaylistModal
          isOpen={showPlaylist}
          onClose={() => setShowPlaylist(false)}
          videos={lesson.videos}
          lessonTitle={lesson.title}
          onSelectVideo={handleVideoSelect}
          isSubscribed={isSubscribed}
          onSubscribeRequest={onSubscribeRequest}
        />
      )}
    </>
  );
};

// Semester Section Component (same as before)
const SemesterSection = ({
  label,
  items,
  styleIndex,
  major,
  searchTerm,
  selectedCategory,
  selectedLevel,
  isSubscribed,
  onSubscribeRequest,
}) => {
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const style = SEMESTER_STYLES[styleIndex % SEMESTER_STYLES.length];
  const [, yearNum, , semNum] = label.split(" ");

  const filtered = items.filter((l) => {
    const matchSearch = l.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === "All" || l.category === selectedCategory;
    const matchLevel =
      selectedLevel === "All Levels" || l.level === selectedLevel;
    return matchSearch && matchCategory && matchLevel;
  });

  if (filtered.length === 0) return null;

  return (
    <div className="mb-12">
      <button
        onClick={() => setOpen(!open)}
        className="lg-semester-header w-full flex items-center justify-between px-6 py-4 mb-6"
        style={{ "--accent": style.rgb }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, rgba(${style.rgb},0.9), rgba(${style.rgb},0.55))`,
              boxShadow: `0 8px 24px rgba(${style.rgb},0.4)`,
            }}
          >
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-400/70">
              {major || "Programme"}
            </p>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
              Year {yearNum} — Semester {semNum}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: `rgba(${style.rgb},0.12)`,
              color: `rgb(${style.rgb})`,
              border: `1px solid rgba(${style.rgb},0.2)`,
            }}
          >
            <BookOpen className="h-3 w-3" /> {filtered.length} subjects
          </span>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            style={{ background: `rgba(${style.rgb},0.12)` }}
          >
            <ChevronDown className="h-5 w-5" style={{ color: `rgb(${style.rgb})` }} />
          </div>
        </div>
      </button>

      {open && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, visibleCount).map((l) => (
              <LessonCard
                key={l.id}
                lesson={l}
                isSubscribed={isSubscribed}
                onSubscribeRequest={onSubscribeRequest}
              />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount((v) => v + 3)}
                className="lg-btn-secondary px-8 py-3 font-bold"
              >
                Show more <ChevronDown className="h-4 w-4 inline ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Main LessonsPage Component
const LessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // ── Read user's major from session ───────────────────────
  const userMajor = (() => {
    try {
      const sess = JSON.parse(
        localStorage.getItem("learnflow_session") || "{}",
      );
      return sess.major || null;
    } catch {
      return null;
    }
  })();

  const userAcademicYear = (() => {
    try {
      const sess = JSON.parse(
        localStorage.getItem("learnflow_session") || "{}",
      );
      return sess.academicYear || sess.academic_year || null;
    } catch {
      return null;
    }
  })();

  // ── Fetch lessons + videos from API (filtered by major) ──
  useEffect(() => {
    fetchLessons(userMajor, userAcademicYear)
      .then((data) => setLessons(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userMajor, userAcademicYear]);
  // ─────────────────────────────────────────────────────────

  const categories = ["All", ...new Set(lessons.map((l) => l.category))];
  const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
  const semesters = buildSemesters(lessons);
  // Define which categories to HIDE
  const hiddenCategories = [
    "Programming",
    "Design",
    "Business",
    "Marketing",
    "Mathematics",
    "Science",
    "General",
    "Project",
    "Management",
    "Systems",
  ];

  const visibleCategories = categories.filter(
    (cat) => !hiddenCategories.includes(cat),
  );

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    const onMouse = (e) =>
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    window.addEventListener("scroll", onScroll);
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  // ── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative isolate overflow-hidden">
        <div className="lg-ambient-bg" />
        <div className="lg-play-orb h-16 w-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <p className="text-slate-500 font-semibold relative z-10">Loading lessons...</p>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 relative isolate overflow-hidden">
        <div className="lg-ambient-bg" />
        <div className="text-5xl relative z-10">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 relative z-10">
          Failed to load lessons
        </h2>
        <p className="text-rose-500 text-sm bg-rose-50/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-rose-100 relative z-10 font-medium">
          {error}
        </p>
        <p className="text-slate-400 text-sm relative z-10">
          Make sure your backend is running on{" "}
          <code className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-mono text-xs">{API_BASE}</code>
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchLessons()
              .then(setLessons)
              .catch((e) => setError(e.message))
              .finally(() => setLoading(false));
          }}
          className="lg-cta-button mt-2 px-7 py-3 relative z-10"
        >
          Retry
        </button>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────

  return (
    <div className="student-page student-lessons min-h-screen relative isolate overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .student-lessons {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
          color: #172033;
        }

        @keyframes fadeInUp { 
          from { opacity:0; transform:translateY(24px) scale(0.97); } 
          to { opacity:1; transform:translateY(0) scale(1); } 
        }
        .animate-fadeInUp { 
          animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both; 
        }

        .line-clamp-2 { 
          display:-webkit-box; 
          -webkit-line-clamp:2; 
          -webkit-box-orient:vertical; 
          overflow:hidden; 
        }

        /* ── Ambient Background ── */
        .lg-ambient-bg {
          position: fixed;
          inset: 0;
          z-index: -3;
          background:
            radial-gradient(ellipse 80% 60% at 8% 5%, rgba(99,102,241,0.18) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 92% 15%, rgba(14,165,233,0.12) 0%, transparent 45%),
            radial-gradient(ellipse 70% 50% at 50% 95%, rgba(139,92,246,0.1) 0%, transparent 50%),
            linear-gradient(165deg, #f0f4ff 0%, #eef2ff 40%, #f8f5ff 100%);
          background-attachment: fixed;
          pointer-events: none;
        }

        .lg-ambient-bg::after {
          content: "";
          position: fixed;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.7;
          pointer-events: none;
        }

        /* ── Liquid Glass Primitives ── */
        .lg-glass {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 1px 1px rgba(255,255,255,0.85) inset, 0 12px 40px rgba(31,41,55,0.08);
        }

        .lg-glass-strong {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 1px 1px rgba(255,255,255,0.95) inset, 0 16px 48px rgba(31,41,55,0.1);
        }

        .lg-preview-banner {
          background:linear-gradient(110deg,rgba(255,251,235,.88),rgba(255,255,255,.72));
          border-color:rgba(245,158,11,.24);
        }
        .lg-preview-title { color:#9a4b05; }
        .lg-preview-copy { color:#b45309; }

        .lg-glass-dark {
          background: rgba(16,18,42,0.6);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(165,180,252,0.15);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 44px rgba(0,0,0,0.3);
        }

        .lg-pill {
          background: rgba(20,20,35,0.35);
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 999px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .lg-play-orb {
          border-radius: 999px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1.5px solid rgba(255,255,255,0.4);
          box-shadow: 0 12px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lg-secondary-button {
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 16px;
          color: #4338ca;
          font-weight: 600;
          transition: all 0.25s ease;
        }
        .lg-secondary-button:hover {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 10px 24px rgba(99,102,241,0.35);
        }

        .lg-cta-button {
          background: var(--accent-gradient);
          border-radius: 16px;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 10px 26px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.3) inset;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .lg-cta-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 36px rgba(99,102,241,0.5), 0 1px 0 rgba(255,255,255,0.3) inset;
        }

        .lg-lesson-card {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.72);
          border-radius: 26px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.85) inset, 0 10px 36px rgba(31,41,55,0.08);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .lg-lesson-card:hover {
          background: rgba(255,255,255,0.75);
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 1px 1px rgba(255,255,255,0.95) inset, 0 28px 60px rgba(31,41,55,0.16);
          border-color: rgba(99,102,241,0.3);
        }
        .lg-lesson-card-dark {
          background: rgba(18,23,49,0.7);
          border-color: rgba(165,180,252,0.15);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 44px rgba(0,0,0,0.25);
        }
        .lg-lesson-card-dark:hover {
          background: rgba(22,28,58,0.8);
          border-color: rgba(165,180,252,0.25);
        }

        .lg-sheen {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 45%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 0.8s ease;
          z-index: 5;
        }
        .lg-sheen-active { transform: translateX(120%); }

        .lg-semester-header {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 24px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.9) inset, 0 8px 28px rgba(31,41,55,0.06);
          transition: all 0.3s ease;
        }
        .lg-semester-header:hover {
          box-shadow: 0 1px 1px rgba(255,255,255,0.9) inset, 0 12px 32px rgba(var(--accent),0.2);
          transform: translateY(-1px);
        }

        .lg-search {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 20px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.9) inset, 0 6px 24px rgba(31,41,55,0.06);
          transition: all 0.2s ease;
        }
        .lg-search:focus-within {
          background: rgba(255,255,255,0.85);
          box-shadow: 0 1px 1px rgba(255,255,255,0.95) inset, 0 8px 28px rgba(99,102,241,0.12);
          border-color: rgba(99,102,241,0.3);
        }

        .lg-chip {
          border-radius: 999px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .lg-chip-active {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff;
          box-shadow: 0 6px 20px rgba(99,102,241,0.35);
          border: 1px solid rgba(255,255,255,0.3);
        }
        .lg-chip-inactive {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.7);
          color: #475569;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .lg-chip-inactive:hover {
          background: rgba(255,255,255,0.8);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        .lg-modal-overlay {
          background: rgba(15,23,42,0.45);
          backdrop-filter: blur(16px) saturate(120%);
          -webkit-backdrop-filter: blur(16px) saturate(120%);
        }

        .lg-modal {
          background: rgba(248,250,255,0.84);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.82);
          border-radius: 32px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.95) inset, 0 30px 80px rgba(15,23,42,0.28);
        }

        .lg-orb {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          filter: blur(70px);
          opacity: 0.7;
          pointer-events: none;
        }

        .lg-sheet {
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
        }

        .lg-modal-title { color: #172033; }
        .lg-modal-subtitle { color: #64748b; }
        .lg-modal-close { color:#59627a; background:rgba(255,255,255,.62); border:1px solid rgba(100,116,139,.12); }
        .lg-modal-close:hover { color:#172033; background:rgba(255,255,255,.94); }
        .lg-lock-badge { color:#4f46e5; background:rgba(99,102,241,.11); border:1px solid rgba(99,102,241,.18); }
        .lg-form-label { color: #475569; }
        .lg-input-icon { color: #7c83a3; }
        .lg-form-helper { color: #64748b; }
        .lg-form-legal { color: #7c8499; }

        .lg-input {
          background: rgba(255,255,255,0.88) !important;
          border: 1.5px solid rgba(100,116,139,0.22);
          border-radius: 14px;
          color: #172033 !important;
          outline: none;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        .lg-filter-chip-active {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff;
          box-shadow: 0 6px 16px rgba(99,102,241,0.35);
        }

        html.dark-mode .lg-modal {
          background: rgba(24,24,42,0.88);
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 1px 1px rgba(255,255,255,0.12) inset, 0 30px 80px rgba(0,0,0,0.5);
        }
        html.dark-mode .lg-sheet { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }
        html.dark-mode .lg-modal-title { color: #fff; }
        html.dark-mode .lg-modal-subtitle { color: #b8bfd3; }
        html.dark-mode .lg-modal-close { color:#d8dceb; background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.1); }
        html.dark-mode .lg-modal-close:hover { color:#fff; background:rgba(255,255,255,.18); }
        html.dark-mode .lg-lock-badge { color:#fff; background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.22); }
        html.dark-mode .lg-form-label { color: #c8ccda; }
        html.dark-mode .lg-input-icon { color: #9da6c4; }
        html.dark-mode .lg-form-helper { color: #9ca3b8; }
        html.dark-mode .lg-form-legal { color: #858ba0; }
        html.dark-mode .lg-input { background: rgba(255,255,255,0.09) !important; border-color: rgba(255,255,255,0.17); color: #fff !important; }
        html.dark-mode .lg-input::placeholder { color: #8f96aa; }
        html.dark-mode .lg-input:focus { background: rgba(255,255,255,0.13) !important; }

        .lg-scroll-progress {
          background: linear-gradient(90deg, #6366f1, #a855f7, #f43f5e);
          box-shadow: 0 2px 12px rgba(99,102,241,0.4);
        }

        .lg-hero-overlay {
          background: linear-gradient(180deg, rgba(10,10,25,0.3) 0%, rgba(10,10,25,0.7) 100%);
        }

        .lg-hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: orbFloat 10s ease-in-out infinite alternate;
        }
        @keyframes orbFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.1); }
        }

        /* Dark mode overrides */
        html.dark-mode .student-lessons {
          color: #f4f7ff;
        }
        html.dark-mode .lg-ambient-bg {
          background:
            radial-gradient(ellipse 80% 60% at 10% 10%, rgba(99,102,241,0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 90% 20%, rgba(14,165,233,0.08) 0%, transparent 45%),
            linear-gradient(145deg, #070816 0%, #0c1024 58%, #0d0b1d 100%);
        }
        html.dark-mode .lg-glass,
        html.dark-mode .lg-search,
        html.dark-mode .lg-semester-header {
          background: rgba(18,23,49,0.75);
          border-color: rgba(165,180,252,0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 14px 38px rgba(0,0,0,0.25);
        }
        html.dark-mode .lg-preview-banner {
          background:linear-gradient(110deg,rgba(69,39,12,.72),rgba(25,27,54,.82));
          border-color:rgba(251,191,36,.28);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 16px 46px rgba(0,0,0,.26);
        }
        html.dark-mode .lg-preview-title { color:#fcd34d; }
        html.dark-mode .lg-preview-copy { color:#fbbf7a; }
        html.dark-mode .lg-chip-inactive {
          background: rgba(25,31,62,0.7);
          border-color: rgba(165,180,252,0.15);
          color: #cbd3ef;
        }
        html.dark-mode .lg-chip-inactive:hover {
          background: rgba(99,102,241,0.2);
          color: #fff;
        }

        @media (max-width: 640px) {
          .lg-modal-overlay { align-items: flex-end; padding: 0; }
          .lg-modal {
            max-width: none;
            max-height: calc(100dvh - 20px);
            overflow-y: auto;
            border-radius: 28px 28px 0 0 !important;
            padding-bottom: env(safe-area-inset-bottom);
          }
          .lg-search { border-radius: 18px; }
          .lg-search > button { border-radius: 14px; margin: 4px; }
          .lg-semester-header { padding: 14px 16px; }
          .lg-semester-header h2 { font-size: 1rem; white-space: nowrap; }
        }
      `}</style>

      {/* Ambient Background */}
      <div className="lg-ambient-bg" />

      {/* Scroll Progress */}
      <div
        className="lg-scroll-progress fixed top-0 left-0 h-1 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Back to Top */}
      <ScrollToTopButton visible={scrollProgress > 20} />

      {/* Hero Section */}
      <div className="student-hero relative w-full h-[520px] overflow-hidden">
        <img
          src={lessonImage}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.05)`,
          }}
        />
        <div className="absolute inset-0 lg-hero-overlay z-[1]" />
        <div className="absolute inset-0 z-[1] opacity-40 pointer-events-none">
          <div className="lg-hero-orb top-16 left-16 w-80 h-80 bg-cyan-400/20" style={{ animationDelay: "0s" }} />
          <div className="lg-hero-orb bottom-16 right-16 w-[28rem] h-[28rem] bg-indigo-500/20" style={{ animationDelay: "3s" }} />
          <div className="lg-hero-orb top-1/2 left-1/2 w-96 h-96 bg-violet-400/10 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: "6s" }} />
        </div>
        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-7xl mx-auto px-5 text-white">
            <div className="lg-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-bold mb-5 text-white/90 uppercase tracking-[0.12em]">
              <GraduationCap className="h-3.5 w-3.5" /> Elearning
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight leading-[1.05]">
              Expand Your Knowledge
            </h1>
            <p className="text-lg max-w-xl text-white/75 font-medium leading-relaxed">
              Video lessons organised by year and semester. First{" "}
              {FREE_VIDEO_LIMIT} videos free.
            </p>
            {!isSubscribed ? (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="lg-btn-primary mt-7 px-7 py-3.5 flex items-center gap-2 text-sm"
              >
                <span>🔓</span> Unlock All — $9.99/mo
              </button>
            ) : (
              <div className="lg-pill mt-7 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white">
                <span>✓</span> Full lesson access
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-14 sm:py-20 relative z-10">
        {/* Free Preview Banner */}
        {!isSubscribed && (
          <div className="lg-glass-strong lg-preview-banner mb-10 p-5 flex justify-between items-center rounded-3xl" style={{ borderLeft: "4px solid rgb(245,158,11)" }}>
            <div>
              <p className="lg-preview-title font-bold text-sm mb-0.5">Free Preview Mode</p>
              <p className="lg-preview-copy text-sm font-medium">
                Watch first {FREE_VIDEO_LIMIT} videos free. Subscribe to unlock all.
              </p>
            </div>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="lg-cta-button px-6 py-2.5 text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)", boxShadow: "0 10px 26px rgba(245,158,11,0.35)" }}
            >
              Unlock All →
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="lg-search flex overflow-hidden">
            <div className="flex-1 flex items-center px-5">
              <Search className="h-5 w-5 text-indigo-400/60" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-0 bg-transparent px-4 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
              />
            </div>
            <button className="lg-btn-primary rounded-l-none px-8 my-1.5 mr-1.5 text-sm">
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-14 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 lg-chip ${selectedCategory === cat ? "lg-chip-active" : "lg-chip-inactive"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="lg-chip-inactive flex items-center gap-2 px-4 py-2.5">
            <Filter className="h-4 w-4 text-indigo-400/60" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-sm bg-transparent focus:outline-none font-semibold text-slate-600 cursor-pointer"
            >
              {levels.map((lv) => (
                <option key={lv}>{lv}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Semester Sections */}
        {semesters.map((sem, idx) => (
          <SemesterSection
            key={sem.label}
            label={sem.label}
            items={sem.items}
            styleIndex={idx}
            major={userMajor}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedLevel={selectedLevel}
            isSubscribed={isSubscribed}
            onSubscribeRequest={() => setShowSubscriptionModal(true)}
          />
        ))}
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={() => {
            setIsSubscribed(true);
            setShowSubscriptionModal(false);
            // You can also store subscription status in localStorage or your backend
            localStorage.setItem("isSubscribed", "true");
          }}
        />
      )}
    </div>
  );
};

export default LessonsPage;
