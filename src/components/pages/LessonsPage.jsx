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
    videos: videosData
      .filter((v) => v.lesson_id === lesson.id)
      .sort((a, b) => a.order_index - b.order_index),
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

// Semester color styles
const SEMESTER_STYLES = [
  {
    gradient: "from-indigo-500 to-violet-600",
    light: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    badge: "bg-indigo-600",
  },
  {
    gradient: "from-cyan-500 to-indigo-600",
    light: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    badge: "bg-cyan-600",
  },
  {
    gradient: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badge: "bg-emerald-600",
  },
  {
    gradient: "from-amber-500 to-orange-600",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-600",
  },
  {
    gradient: "from-rose-500 to-pink-600",
    light: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    badge: "bg-rose-600",
  },
  {
    gradient: "from-violet-500 to-purple-600",
    light: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    badge: "bg-violet-600",
  },
  {
    gradient: "from-sky-500 to-blue-600",
    light: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    badge: "bg-sky-600",
  },
  {
    gradient: "from-fuchsia-500 to-pink-600",
    light: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
    badge: "bg-fuchsia-600",
  },
];

// Video Count Badge Component
const VideoCountBadge = ({ count }) => {
  if (!count) return null;
  return (
    <div className="absolute top-4 left-16 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-8 pt-8 pb-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold mb-1">Unlock Full Access</h2>
          <p className="text-indigo-200 text-sm">
            Get unlimited access to all {FREE_VIDEO_LIMIT}+ videos
          </p>
          <div className="mt-4 inline-block bg-white/20 rounded-full px-4 py-1.5">
            <span className="text-2xl font-bold">$9.99</span>
            <span className="text-sm">/month</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  placeholder="sok chea"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.fullName ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="sokchea@example.com"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.cardNumber ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.cardNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiry Date & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.expiryDate ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.expiryDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.cvv ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            {/* Secure Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
              <Lock className="h-3 w-3" />
              Secure 256-bit SSL encryption
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            <p className="text-center text-xs text-gray-500">
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
        className={`group rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border transform hover:-translate-y-2 ${
          isDark ? "bg-[#1a1a35] border-[#2a2a4a]" : "bg-white border-gray-100"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Card Header */}
        <div
          className={`relative h-44 bg-gradient-to-br ${cardGradient} overflow-hidden cursor-pointer`}
          onClick={handlePlayVideo}
        >
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${hovered ? "opacity-40" : "opacity-0"}`}
          />

          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              {lesson.category}
            </span>
          </div>

          {(hasVideos || lesson.videoLink) && (
            <VideoCountBadge count={videoCount || 1} />
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-lg font-bold text-white mb-1">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-4 text-white/90 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.credit} credits
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400" />
                {lesson.rating}
              </span>
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          >
            <div className="bg-white/30 backdrop-blur-sm rounded-full p-3">
              {videoCount > 1 ? (
                <Layers className="h-10 w-10 text-white" />
              ) : (
                <PlayCircle className="h-10 w-10 text-white" />
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
                  ? "bg-green-100 text-green-700"
                  : lesson.level === "Intermediate"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {lesson.level}
            </span>
            <span
              className={`flex items-center text-xs ${isDark ? "text-[#7777aa]" : "text-gray-500"}`}
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
              <div className="text-xs font-semibold text-gray-400 flex items-center gap-1 mb-1">
                <ListVideo className="h-3 w-3" /> Playlist:
              </div>
              <div className="flex flex-wrap gap-1">
                {lesson.videos.slice(0, 3).map((v, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    {i + 1}. {v.title.substring(0, 12)}…
                  </span>
                ))}
                {videoCount > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    +{videoCount - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handlePlayVideo}
            className="w-full group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: isDark ? "#14142b" : "#f9fafb",
              color: isDark ? "#9999cc" : "#374151",
            }}
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
    <div className="mb-14">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-gradient-to-r ${style.gradient} shadow-lg mb-6 hover:shadow-xl transition-all`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white/70 text-xs font-semibold uppercase">
              {major || "Programme"}
            </p>
            <h2 className="text-white text-xl font-bold">
              Year {yearNum} — Semester {semNum}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-white text-xs">
            <BookOpen className="h-3 w-3" /> {filtered.length} subjects
          </span>
          <div
            className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <ChevronDown className="h-5 w-5 text-white" />
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
                className="px-7 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all"
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
  const isDark = document.documentElement.classList.contains("dark-mode");

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading lessons...</p>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800">
          Failed to load lessons
        </h2>
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
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
          className="mt-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-[#0d0d1a]" : "bg-gradient-to-b from-gray-50 to-white"}`}
    >
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out both; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>

      {/* Scroll Progress */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Back to Top */}
      {scrollProgress > 20 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
        >
          ↑
        </button>
      )}

      {/* Subscription Badge */}
      <div className="fixed top-4 right-4 z-40">
        {isSubscribed ? (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span>✅</span> Subscribed
          </div>
        ) : (
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:from-indigo-700 transition-all flex items-center gap-2"
          >
            <span>🔓</span> Subscribe
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[500px] overflow-hidden">
        <img
          src={lessonImage}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.05)`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-5 text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Expand Your Knowledge
            </h1>
            <p className="text-lg max-w-xl">
              Video lessons organised by year and semester. First{" "}
              {FREE_VIDEO_LIMIT} videos free.
            </p>
            {!isSubscribed && (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="mt-6 bg-white text-indigo-700 font-bold px-6 py-3 rounded-2xl hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                <span>🔓</span> Unlock All — $9.99/mo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Free Preview Banner */}
        {!isSubscribed && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-amber-900">Free Preview Mode</p>
              <p className="text-amber-700 text-sm">
                Watch first {FREE_VIDEO_LIMIT} videos free. Subscribe to unlock
                all.
              </p>
            </div>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-amber-600 text-white px-5 py-2 rounded-xl hover:bg-amber-700 transition-colors"
            >
              Unlock All →
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div
            className={`flex rounded-2xl border shadow-sm ${isDark ? "bg-[#1a1a35] border-[#2a2a4a]" : "bg-white border-gray-200"}`}
          >
            <div className="flex-1 flex items-center px-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 focus:outline-none"
              />
            </div>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 rounded-xl font-semibold">
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? "bg-indigo-600 text-white" : `bg-white border ${isDark ? "border-[#2a2a4a] text-gray-300" : "border-gray-200 text-gray-600"}`}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg px-4 py-2 text-sm border focus:outline-none bg-white"
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
