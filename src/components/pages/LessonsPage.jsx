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
    <div className="lg-pill absolute top-4 left-16 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white">
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
      className="subscription-overlay fixed inset-0 z-[120] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="subscription-modal student-liquid-modal lg-modal relative w-full max-w-md overflow-hidden animate-fadeInUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ambient glass glow blobs */}
        <div className="lg-orb" style={{ top: -60, left: -40, background: "rgba(99,102,241,0.55)" }} />
        <div className="lg-orb" style={{ bottom: -70, right: -50, background: "rgba(217,70,239,0.4)" }} />

        <div className="subscription-heading relative px-8 pt-9 pb-7 text-center">
          <button
            onClick={onClose}
            className="subscription-close absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            aria-label="Close subscription dialog"
          >
            ✕
          </button>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl lg-icon-chip">
            <Lock className="h-5 w-5" />
          </div>
          <h2 id="subscription-title" className="text-2xl font-bold tracking-tight mb-1">Unlock Full Access</h2>
          <p className="subscription-muted text-sm">
            Get unlimited access to all {FREE_VIDEO_LIMIT}+ videos
          </p>
          <div className="mt-4 inline-flex items-baseline gap-1 lg-pill px-4 py-1.5">
            <span className="text-2xl font-bold">$9.99</span>
            <span className="subscription-muted text-sm">/month</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative px-6 pb-6">
          <div className="lg-sheet rounded-[26px] p-5 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User className="subscription-field-icon absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="sok chea"
                  className={`lg-input w-full pl-10 pr-3 py-2.5 ${
                    errors.fullName ? "lg-input-error" : ""
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-rose-300 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="subscription-field-icon absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="sokchea@example.com"
                  className={`lg-input w-full pl-10 pr-3 py-2.5 ${
                    errors.email ? "lg-input-error" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-rose-300 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="subscription-field-icon absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" />
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
                    errors.cardNumber ? "lg-input-error" : ""
                  }`}
                />
              </div>
              {errors.cardNumber && (
                <p className="text-rose-300 text-xs mt-1">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiry Date & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">
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
                    errors.expiryDate ? "lg-input-error" : ""
                  }`}
                />
                {errors.expiryDate && (
                  <p className="text-rose-300 text-xs mt-1">
                    {errors.expiryDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide">
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
                    errors.cvv ? "lg-input-error" : ""
                  }`}
                />
                {errors.cvv && (
                  <p className="text-rose-300 text-xs mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            {/* Secure Badge */}
            <div className="subscription-muted flex items-center justify-center gap-2 text-xs mt-1">
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

            <p className="subscription-footer text-center text-[11px] leading-relaxed">
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
            className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${hovered ? "opacity-40" : "opacity-0"}`}
          />

          <div className="absolute top-4 right-4">
            <span className="lg-pill px-3 py-1 text-white text-[11px] font-medium">
              {lesson.category}
            </span>
          </div>

          {(hasVideos || lesson.videoLink) && (
            <VideoCountBadge count={videoCount || 1} />
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-lg font-bold text-white mb-1 drop-shadow-sm">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-4 text-white/90 text-xs">
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
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          >
            <div className="lg-play-orb flex items-center justify-center h-16 w-16">
              {videoCount > 1 ? (
                <Layers className="h-8 w-8 text-white" />
              ) : (
                <PlayCircle className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                lesson.level === "Beginner"
                  ? "bg-emerald-500/15 text-emerald-600"
                  : lesson.level === "Intermediate"
                    ? "bg-amber-500/15 text-amber-600"
                    : "bg-rose-500/15 text-rose-600"
              }`}
            >
              {lesson.level}
            </span>
            <span
              className={`flex items-center text-xs ${isDark ? "text-[#9999cc]" : "text-gray-500"}`}
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              {lesson.students?.toLocaleString() || "0"}
            </span>
          </div>

          <p
            className={`text-sm mb-4 line-clamp-2 ${isDark ? "text-[#9999cc]" : "text-gray-600"}`}
          >
            {lesson.description}
          </p>

          {videoCount > 1 && (
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1.5 uppercase tracking-wide">
                <ListVideo className="h-3 w-3" /> Playlist
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lesson.videos.slice(0, 3).map((v, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-black/[0.04] text-gray-600 border border-black/[0.05]"
                  >
                    {i + 1}. {v.title.substring(0, 12)}…
                  </span>
                ))}
                {videoCount > 3 && (
                  <span className="text-xs bg-black/[0.04] text-gray-600 border border-black/[0.05] px-2 py-1 rounded-full">
                    +{videoCount - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handlePlayVideo}
            className="lg-secondary-button w-full py-2.5 flex items-center justify-center gap-2 text-sm"
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
        className="semester-header lg-header-card w-full flex items-center justify-between px-6 py-4 mb-6"
        style={{ "--accent": style.rgb }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, rgba(${style.rgb},0.9), rgba(${style.rgb},0.55))`,
              boxShadow: `0 6px 16px rgba(${style.rgb},0.35)`,
            }}
          >
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <p className="semester-kicker text-[11px] font-semibold uppercase tracking-wide">
              {major || "Programme"}
            </p>
            <h2 className="semester-title text-xl font-bold tracking-tight">
              Year {yearNum} — Semester {semNum}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: `rgba(${style.rgb},0.12)`,
              color: `rgb(${style.rgb})`,
            }}
          >
            <BookOpen className="h-3 w-3" /> {filtered.length} subjects
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${open ? "rotate-180" : ""}`}
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
                className="lg-secondary-button px-7 py-3"
              >
                Show more <ChevronDown className="h-4 w-4 inline" />
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="lg-play-orb h-16 w-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <p className="text-gray-500 font-medium">Loading lessons...</p>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gradient-to-b from-rose-50 via-white to-white">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800">
          Failed to load lessons
        </h2>
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-full border border-red-100">
          {error}
        </p>
        <p className="text-gray-400 text-sm">
          Make sure your backend is running on{" "}
          <code>{API_BASE}</code>
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
          className="lg-cta-button mt-2 px-6 py-2.5"
        >
          Retry
        </button>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────

  return (
    <div className="student-page student-lessons min-h-screen">
      <style>{`
        .student-lessons {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, -apple-system, sans-serif;
          color: #172033;
          background: radial-gradient(circle at 15% 0%, rgba(99,102,241,0.10), transparent 34%), #f4f7fc;
        }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .animate-fadeInUp { animation: fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

        /* ── Liquid glass primitives ───────────────────────── */
        .lg-card {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 26px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.8) inset, 0 8px 30px rgba(31,41,55,0.08);
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease;
        }
        .lg-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 1px 1px rgba(255,255,255,0.8) inset, 0 20px 45px rgba(31,41,55,0.14);
        }
        .lg-card-dark {
          background: rgba(26,26,53,0.55);
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 1px 1px rgba(255,255,255,0.05) inset, 0 8px 30px rgba(0,0,0,0.4);
        }
        .lg-sheen {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 45%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 0.7s ease;
          z-index: 5;
        }
        .lg-sheen-active { transform: translateX(120%); }

        .lg-header-card {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 22px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.9) inset, 0 6px 24px rgba(31,41,55,0.06);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .lg-header-card:hover {
          box-shadow: 0 1px 1px rgba(255,255,255,0.9) inset, 0 10px 28px rgba(var(--accent),0.18);
        }

        .lg-pill {
          background: rgba(20,20,35,0.35);
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 999px;
        }

        .lg-play-orb {
          border-radius: 999px;
          background: rgba(255,255,255,0.22);
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
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
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 16px;
          color: #fff;
          font-weight: 700;
          box-shadow: 0 10px 26px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.3) inset;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .lg-cta-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(99,102,241,0.5), 0 1px 0 rgba(255,255,255,0.3) inset;
        }

        .lg-modal {
          background: rgba(24,24,42,0.72);
          backdrop-filter: blur(30px) saturate(200%);
          -webkit-backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 32px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.15) inset, 0 30px 70px rgba(0,0,0,0.5);
        }
        .lg-orb {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          filter: blur(60px);
          opacity: 0.7;
          pointer-events: none;
        }
        .lg-icon-chip {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
        }
        .lg-sheet {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .lg-input {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .lg-input::placeholder { color: rgba(255,255,255,0.35); }
        .lg-input:focus { border-color: rgba(165,180,252,0.6); background: rgba(255,255,255,0.1); }
        .lg-input-error { border-color: rgba(251,113,133,0.7); }

        /* Subscription sheet: readable iOS-style material in both themes. */
        .subscription-overlay {
          background: rgba(8, 12, 24, 0.42);
          backdrop-filter: blur(3px) saturate(115%);
          -webkit-backdrop-filter: blur(3px) saturate(115%);
        }
        .subscription-modal {
          color: #182238;
          background: rgba(244, 247, 255, 0.88) !important;
          border-color: rgba(255, 255, 255, 0.92) !important;
          box-shadow: 0 32px 90px rgba(22, 34, 76, 0.30), inset 0 1px 0 #fff !important;
        }
        .subscription-modal .subscription-heading,
        .subscription-modal h2,
        .subscription-modal label { color: #182238 !important; }
        .subscription-modal .subscription-muted,
        .subscription-modal .subscription-footer { color: #64748b !important; }
        .subscription-modal .lg-sheet {
          background: rgba(255, 255, 255, 0.58);
          border-color: rgba(255, 255, 255, 0.92);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.95);
        }
        .subscription-modal .lg-pill,
        .subscription-modal .lg-icon-chip,
        .subscription-modal .subscription-close {
          color: #4338ca;
          background: rgba(99, 102, 241, 0.10);
          border: 1px solid rgba(99, 102, 241, 0.18);
        }
        .subscription-modal .subscription-close:hover { background: rgba(99, 102, 241, 0.18); }
        .subscription-modal .subscription-field-icon { color: #64748b; }
        .subscription-modal .lg-input {
          background: rgba(255, 255, 255, 0.86) !important;
          border-color: rgba(100, 116, 139, 0.28) !important;
          color: #172033 !important;
          caret-color: #4f46e5;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
        }
        .subscription-modal .lg-input::placeholder { color: #8995a9 !important; opacity: 1; }
        .subscription-modal .lg-input:focus {
          background: rgba(255, 255, 255, 0.98) !important;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14);
        }
        .subscription-modal .lg-input-error { border-color: #e11d48 !important; }

        html.dark-mode .subscription-overlay { background: rgba(2, 5, 15, 0.62); }
        html.dark-mode .subscription-modal {
          color: #f5f7ff;
          background: rgba(12, 16, 36, 0.91) !important;
          border-color: rgba(165, 180, 252, 0.24) !important;
          box-shadow: 0 36px 100px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.09) !important;
        }
        html.dark-mode .subscription-modal .subscription-heading,
        html.dark-mode .subscription-modal h2,
        html.dark-mode .subscription-modal label { color: #f5f7ff !important; }
        html.dark-mode .subscription-modal .subscription-muted { color: #b6c0df !important; }
        html.dark-mode .subscription-modal .subscription-footer { color: #929dbc !important; }
        html.dark-mode .subscription-modal .lg-sheet {
          background: rgba(7, 10, 27, 0.58);
          border-color: rgba(165, 180, 252, 0.16);
        }
        html.dark-mode .subscription-modal .lg-pill,
        html.dark-mode .subscription-modal .lg-icon-chip,
        html.dark-mode .subscription-modal .subscription-close {
          color: #ffffff;
          background: rgba(165, 180, 252, 0.13);
          border-color: rgba(199, 210, 254, 0.22);
        }
        html.dark-mode .subscription-modal .subscription-field-icon { color: #aeb8d8; }
        html.dark-mode .subscription-modal .lg-input {
          background: rgba(5, 8, 24, 0.72) !important;
          border-color: rgba(165, 180, 252, 0.24) !important;
          color: #f5f7ff !important;
          caret-color: #a5b4fc;
        }
        html.dark-mode .subscription-modal .lg-input::placeholder { color: #7f8bad !important; }
        html.dark-mode .subscription-modal .lg-input:focus {
          background: rgba(10, 14, 36, 0.94) !important;
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.18);
        }

        @media (max-width: 640px) {
          .subscription-overlay {
            align-items: flex-end;
            padding: max(8px, env(safe-area-inset-top)) 0 0;
          }
          .subscription-modal {
            max-width: none;
            max-height: calc(100dvh - max(8px, env(safe-area-inset-top)));
            overflow-y: auto;
            border-radius: 30px 30px 0 0 !important;
            padding-bottom: env(safe-area-inset-bottom);
          }
          .subscription-modal .subscription-heading { padding: 24px 22px 18px; }
          .subscription-modal form { padding: 0 12px 12px; }
          .subscription-modal .lg-sheet { padding: 16px; border-radius: 23px; }
        }

        .lg-searchbar {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 20px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.9) inset, 0 6px 20px rgba(31,41,55,0.06);
        }

        .lg-filter-chip {
          border-radius: 999px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .lg-filter-chip-active {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff;
          box-shadow: 0 6px 16px rgba(99,102,241,0.35);
        }
        .lg-filter-chip-inactive {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.7);
          color: #4b5563;
        }
        .lg-filter-chip-inactive:hover {
          background: rgba(255,255,255,0.85);
        }

        .student-lessons .semester-kicker { color: #64748b; }
        .student-lessons .semester-title { color: #172033; }
        .student-lessons .lesson-search-input { color: #172033; }
        .student-lessons .lesson-search-input::placeholder { color: #94a3b8; }
        .student-lessons .lesson-level-select { color: #334155; }
        .student-lessons .lesson-level-select option { color: #172033; background: #ffffff; }
        .student-lessons .preview-title { color: #92400e; }
        .student-lessons .preview-copy { color: #b45309; }

        html.dark-mode .student-lessons {
          color: #f4f7ff;
          background: radial-gradient(circle at 15% 0%, rgba(99,102,241,0.16), transparent 35%), #080b1b;
        }
        html.dark-mode .student-lessons .lg-card {
          background: rgba(18,23,49,0.78);
          border-color: rgba(165,180,252,0.17);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 44px rgba(0,0,0,0.30);
        }
        html.dark-mode .student-lessons .lg-header-card,
        html.dark-mode .student-lessons .lg-searchbar {
          background: rgba(18,23,49,0.78);
          border-color: rgba(165,180,252,0.20);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 38px rgba(0,0,0,0.28);
        }
        html.dark-mode .student-lessons .semester-kicker { color: #9aa7cc; }
        html.dark-mode .student-lessons .semester-title { color: #f5f7ff; }
        html.dark-mode .student-lessons .lesson-search-input { color: #f5f7ff; }
        html.dark-mode .student-lessons .lesson-search-input::placeholder { color: #8490b5; }
        html.dark-mode .student-lessons .lesson-level-select { color: #e7ebff; }
        html.dark-mode .student-lessons .lesson-level-select option { color: #f5f7ff; background: #121731; }
        html.dark-mode .student-lessons .lg-filter-chip-inactive {
          color: #cbd3ef;
          background: rgba(25,31,62,0.78);
          border-color: rgba(165,180,252,0.18);
        }
        html.dark-mode .student-lessons .lg-filter-chip-inactive:hover {
          color: #ffffff;
          background: rgba(99,102,241,0.25);
        }
        html.dark-mode .student-lessons .preview-banner {
          background: rgba(51,36,18,0.74);
          border-color: rgba(251,191,36,0.28);
        }
        html.dark-mode .student-lessons .preview-title { color: #fcd34d; }
        html.dark-mode .student-lessons .preview-copy { color: #fbbf24; }

        @media (max-width: 640px) {
          .student-lessons .lessons-content { padding: 28px 12px 40px; }
          .student-lessons .preview-banner { align-items: flex-start; gap: 14px; border-radius: 22px; }
          .student-lessons .preview-banner button { flex: 0 0 auto; padding-left: 14px; padding-right: 14px; }
          .student-lessons .lg-searchbar { border-radius: 18px; }
          .student-lessons .lg-searchbar > button { padding-left: 16px; padding-right: 16px; }
          .student-lessons .filters-row { margin-bottom: 32px; }
          .student-lessons .level-filter { width: 100%; justify-content: space-between; padding: 10px 14px; }
          .student-lessons .semester-header { padding: 13px 14px; border-radius: 22px; }
          .student-lessons .semester-header > div:first-child { gap: 11px; min-width: 0; }
          .student-lessons .semester-header h2 { font-size: 1rem; white-space: nowrap; }
          .student-lessons .semester-header > div:first-child > div:first-child { width: 42px; height: 42px; flex: 0 0 42px; }
        }
      `}</style>

      {/* Scroll Progress */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-400 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Back to Top */}
      {scrollProgress > 20 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="lg-play-orb fixed bottom-8 right-8 z-40 w-12 h-12 text-white transition-transform hover:scale-105 flex items-center justify-center"
        >
          ↑
        </button>
      )}

      {/* Hero Section */}
      <div className="student-hero relative w-full h-[500px] overflow-hidden">
        <img
          src={lessonImage}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.05)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,25,0.35) 0%, rgba(10,10,25,0.65) 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-5 text-white">
            <div className="lg-pill inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium mb-4 text-white/90">
              <GraduationCap className="h-3.5 w-3.5" /> Elearning
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Expand Your Knowledge
            </h1>
            <p className="text-lg max-w-xl text-white/85">
              Video lessons organised by year and semester. First{" "}
              {FREE_VIDEO_LIMIT} videos free.
            </p>
            {!isSubscribed ? (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="lg-cta-button mt-6 px-6 py-3 flex items-center gap-2"
              >
                <span>🔓</span> Unlock All — $9.99/mo
              </button>
            ) : (
              <div className="lg-pill mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white">
                <span>✓</span> Full lesson access
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lessons-content max-w-7xl mx-auto px-5 py-12">
        {/* Free Preview Banner */}
        {!isSubscribed && (
          <div className="preview-banner lg-header-card mb-8 p-4 flex justify-between items-center" style={{ "--accent": "245,158,11" }}>
            <div>
              <p className="preview-title font-semibold">Free Preview Mode</p>
              <p className="preview-copy text-sm">
                Watch first {FREE_VIDEO_LIMIT} videos free. Subscribe to unlock
                all.
              </p>
            </div>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="lg-cta-button px-5 py-2.5 text-sm"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)", boxShadow: "0 10px 26px rgba(245,158,11,0.35)" }}
            >
              Unlock All →
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="lg-searchbar flex overflow-hidden">
            <div className="flex-1 flex items-center px-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="lesson-search-input flex-1 min-w-0 bg-transparent px-4 py-3.5 focus:outline-none"
              />
            </div>
            <button className="lg-cta-button rounded-l-none px-7 my-1 mr-1">
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-row mb-12 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-sm lg-filter-chip ${selectedCategory === cat ? "lg-filter-chip-active" : "lg-filter-chip-inactive"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="level-filter lg-filter-chip-inactive flex items-center gap-2 px-3 py-1.5">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="lesson-level-select text-sm bg-transparent focus:outline-none"
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
