import { downloadDashboardReport } from "../DashboardShared/reportPdf";
import "./teacherDashboard.css";
import Toast from "./components/Toast";
import VideoCard from "./components/VideoCard";
import VideoFormModal from "./components/VideoFormModal";
// TeacherDashboard.jsx — Complete with major filtering
import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../config/api";
import ExamQuestionForm from "../ExamQuestionForm";
import logo from "../../assets/image/logo.png";
import {
  approveProject as approveProjectAPI,
  createVideo as createVideoAPI,
  deleteVideo as deleteVideoAPI,
  fetchLessons as fetchLessonsFromAPI,
  fetchProjects as fetchProjectsFromAPI,
  fetchVideos as fetchVideosFromAPI,
  updateVideo as updateVideoAPI,
} from "./dashboardApi";
import {
  PROJECT_MAJOR_PREFIX,
  TEACHER_APPROVED_TAG,
  applyStoredTheme,
  dedupeVideosByLessonSlot,
  getProjectMajor,
  getStoredTheme,
  normalizeProjectTags,
} from "./dashboardUtils";

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

// ─────────────────────────────────────────────────────────────
//  NOTIFICATION COMPONENT
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
  const [_years, setYears] = useState([]);
  const [_semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedYear, _setSelectedYear] = useState("");
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
      downloadDashboardReport({
        report,
        subject: "LearnFlow teacher report",
        author: user?.name || "LearnFlow Teacher",
        headerLabel: "LearnFlow Teacher",
        footerLabel: `${user?.name || "Teacher"} - ${teacherMajor || "All majors"}`,
      });
    } catch (error) {
      console.error("generateTeacherReport:", error);
      alert(`Could not generate the PDF report.${error?.message ? ` ${error.message}` : ""}`);
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
                {React.createElement(Icon, { size: 16 })}
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
                      {React.createElement(Icon, { size: 18, color })}
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
                            {React.createElement(Icon, { size: 15 })}
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

      
    </>
  );
};

export default TeacherDashboard;
