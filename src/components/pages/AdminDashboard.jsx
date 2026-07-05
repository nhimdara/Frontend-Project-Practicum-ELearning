// ─────────────────────────────────────────────────────────────
//  AdminDashboard.jsx — responsive version
//  • Collapsible sidebar with hamburger on mobile
//  • Stats grid: 2-col on mobile → 4-col on lg
//  • Users table → card list on mobile (< md)
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL, API_ORIGIN } from "../../config/api";
import {
  Shield,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Search,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Plus,
  Save,
  Edit3,
  ChevronRight,
  UserCheck,
  UserX,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import logo from "./../assets/image/logo.png";

const API = API_ORIGIN;
const API_BASE = API_BASE_URL;
const MAJORS = ["ITE", "IT", "Mathematics"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const COLORS = [
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
];

function getCurrentAcademicYear(startYear) {
  const start = Number.parseInt(startYear, 10);
  if (Number.isNaN(start)) return 1;
  return Math.min(4, Math.max(1, new Date().getFullYear() - start + 1));
}

const DEFAULT_ADMIN_SETTINGS = {
  defaultMajor: "ITE",
  publishNewLessons: true,
  compactTables: false,
  themeMode: "dark",
  profileName: "",
  profileEmail: "",
};

const emptyStudentForm = {
  name: "",
  major: "ITE",
  startYear: new Date().getFullYear(),
  endYear: new Date().getFullYear() + 4,
  password: "Student@123",
};

const emptyTeacherForm = {
  name: "",
  email: "",
  major: "ITE",
  password: "Teacher@123",
};

const emptyLessonForm = {
  id: null,
  title: "",
  description: "",
  category_id: "",
  semester_id: "",
  level: "Beginner",
  hours: "",
  credit: 3,
  color: "#2563eb",
  option: "",
  major: "ITE",
  is_published: true,
  videoTitle: "",
  videoLink: "",
  videoDuration: "",
  videoDescription: "",
  videoIsFree: true,
};

const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar
  const [lessons, setLessons] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [studentMessage, setStudentMessage] = useState("");
  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
  const [teacherMessage, setTeacherMessage] = useState("");
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [lessonMessage, setLessonMessage] = useState("");
  const [lessonError, setLessonError] = useState("");
  const [lessonMajorFilter, setLessonMajorFilter] = useState("all");
  const [lessonYearFilter, setLessonYearFilter] = useState("all");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [health, setHealth] = useState(null);
  const [adminSettings, setAdminSettings] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("learnflow_admin_settings") || "{}",
      );
      return {
        ...DEFAULT_ADMIN_SETTINGS,
        profileName: user?.name || "",
        profileEmail: user?.email || "",
        ...saved,
      };
    } catch {
      return {
        ...DEFAULT_ADMIN_SETTINGS,
        profileName: user?.name || "",
        profileEmail: user?.email || "",
      };
    }
  });

  const displayUser = {
    ...user,
    name: adminSettings.profileName || user?.name || "Admin",
    email: adminSettings.profileEmail || user?.email || "",
  };

  // ── Fetch users ───────────────────────────────────────────
  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API}/api/users`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setApiError("Could not load users from database.");
      console.error("fetchUsers:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLessons = useCallback(async () => {
    setLessonError("");
    try {
      const res = await fetch(`${API_BASE}/lessons/filter?include_unpublished=1`);
      if (res.ok) {
        setLessons(await res.json());
        return;
      }

      const fallback = await fetch(`${API_BASE}/lessons`);
      if (!fallback.ok) throw new Error(`Server error ${fallback.status}`);
      setLessons(await fallback.json());
    } catch (err) {
      setLessonError("Could not load lessons from database.");
      console.error("fetchLessons:", err.message);
    }
  }, []);

  const refreshReferences = useCallback(async () => {
    try {
      const [yearsRes, semestersRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/years`),
        fetch(`${API_BASE}/semesters`),
        fetch(`${API_BASE}/categories`),
      ]);
      setYears(await yearsRes.json());
      setSemesters(await semestersRes.json());
      setCategories(await categoriesRes.json());
    } catch (err) {
      console.error("fetchReferences:", err.message);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth({ ok: res.ok, ...data });
    } catch (err) {
      setHealth({ ok: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    refreshUsers();
    refreshLessons();
    refreshReferences();
    refreshHealth();
  }, [refreshUsers, refreshLessons, refreshReferences, refreshHealth]);

  // Close sidebar when route changes on mobile
  const handleTabChange = (id) => {
    setActiveTab(id);
    refreshUsers();
    refreshLessons();
    setSidebarOpen(false);
  };

  // ── Derived stats ─────────────────────────────────────────
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status !== "inactive").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const newToday = users.filter((u) => u.joinDate === todayStr).length;

  const STATS = [
    {
      label: "Registered Users",
      value: totalUsers,
      delta: newToday > 0 ? `+${newToday} today` : "0 today",
      icon: Users,
      light: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Active Users",
      value: activeUsers,
      delta: `${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%`,
      icon: UserCheck,
      light: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active Courses",
      value: lessons.length,
      delta: `${lessons.filter((lesson) => lesson.is_published).length} live`,
      icon: BookOpen,
      light: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Completion Rate",
      value: "73%",
      delta: "+5%",
      icon: TrendingUp,
      light: "bg-amber-50 text-amber-600",
    },
  ];

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("deleteUser:", err.message);
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const students = users.filter((u) => ["student", "client"].includes(u.role));
  const filtered = students.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const teachers = users.filter((u) => u.role === "teacher");
  const filteredLessons = lessons.filter((lesson) => {
    const matchesMajor =
      lessonMajorFilter === "all" || lesson.major === lessonMajorFilter;
    const matchesYear =
      lessonYearFilter === "all" ||
      String(lesson.year_id) === String(lessonYearFilter);
    return matchesMajor && matchesYear;
  });

  const generatedEmailPreview = (() => {
    const clean = studentForm.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 32);
    if (!clean) return "";
    const end = String(studentForm.endYear).slice(-2);
    const start = String(studentForm.startYear).slice(-2);
    return `${clean}.${end}${start}@elearning.com`;
  })();

  const updateStudentForm = (field, value) => {
    setStudentForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "startYear") {
        next.endYear = Number(value) + 4;
      }
      return next;
    });
    setStudentMessage("");
  };

  const teacherEmailPreview = (() => {
    const typedEmail = teacherForm.email.trim();
    if (typedEmail) return typedEmail.toLowerCase();

    const clean = teacherForm.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 32);
    return clean ? `${clean}.teacher@elearning.com` : "";
  })();

  const updateTeacherForm = (field, value) => {
    setTeacherForm((prev) => ({ ...prev, [field]: value }));
    setTeacherMessage("");
  };

  const createTeacher = async (event) => {
    event.preventDefault();
    setTeacherMessage("");
    try {
      const res = await fetch(`${API_BASE}/users/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not create teacher.");
      }
      setTeacherMessage(
        `Created ${data.user.email} with password ${data.temporaryPassword}`,
      );
      setTeacherForm(emptyTeacherForm);
      refreshUsers();
    } catch (err) {
      setTeacherMessage(err.message);
    }
  };

  const createAccount = async (event) => {
    event.preventDefault();
    setStudentMessage("");
    try {
      const payload = {
        ...studentForm,
        academicYear: undefined,
      };
      const res = await fetch(`${API_BASE}/users/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not create student.");
      }
      setStudentMessage(
        `Created ${data.user.email} with password ${data.temporaryPassword}`,
      );
      setStudentForm(emptyStudentForm);
      refreshUsers();
    } catch (err) {
      setStudentMessage(err.message);
    }
  };

  const updateUserMajor = async (userRow, major) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userRow.id}/major`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ major }),
      });
      if (!res.ok) throw new Error("Could not update major.");
      setUsers((prev) =>
        prev.map((u) => (u.id === userRow.id ? { ...u, major } : u)),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const updateLessonForm = (field, value) => {
    setLessonForm((prev) => ({ ...prev, [field]: value }));
    setLessonMessage("");
  };

  const updateAdminSetting = (field, value) => {
    setAdminSettings((prev) => ({ ...prev, [field]: value }));
    setSettingsMessage("");
  };

  const saveAdminSettings = () => {
    localStorage.setItem(
      "learnflow_admin_settings",
      JSON.stringify(adminSettings),
    );

    const updatedProfile = {
      name: adminSettings.profileName.trim() || user?.name || "Admin",
      email: adminSettings.profileEmail.trim() || user?.email || "",
    };

    try {
      const session = JSON.parse(
        localStorage.getItem("learnflow_session") || "null",
      );
      if (session) {
        localStorage.setItem(
          "learnflow_session",
          JSON.stringify({ ...session, ...updatedProfile }),
        );
      }
      localStorage.setItem(
        "learnflow_admin_profile",
        JSON.stringify(updatedProfile),
      );
    } catch {}

    document.documentElement.classList.toggle(
      "dark-mode",
      adminSettings.themeMode === "dark",
    );
    localStorage.setItem(
      "learnflow_settings",
      JSON.stringify({ theme: adminSettings.themeMode }),
    );
    setStudentForm((prev) => ({
      ...prev,
      major: adminSettings.defaultMajor,
    }));
    setTeacherForm((prev) => ({
      ...prev,
      major: adminSettings.defaultMajor,
    }));
    setLessonForm((prev) => ({
      ...prev,
      major: adminSettings.defaultMajor,
      is_published: adminSettings.publishNewLessons,
    }));
    setSettingsMessage("Settings saved to this browser.");
  };

  const editLesson = (lesson) => {
    setLessonForm({
      id: lesson.id,
      title: lesson.title || "",
      description: lesson.description || "",
      category_id: lesson.category_id || "",
      semester_id: lesson.semester_id || "",
      level: lesson.level || "Beginner",
      hours: lesson.hours || "",
      credit: lesson.credit || 3,
      color: lesson.color || "#2563eb",
      option: lesson.option || "",
      major: lesson.major || "ITE",
      is_published: lesson.is_published !== 0,
      videoTitle: "",
      videoLink: "",
      videoDuration: "",
      videoDescription: "",
      videoIsFree: true,
    });
    setActiveTab("lessons");
  };

  const resetLessonForm = (clearMessage = true) => {
    setLessonForm(emptyLessonForm);
    if (clearMessage) setLessonMessage("");
  };

  const saveLesson = async (event) => {
    event.preventDefault();
    setLessonMessage("");
    try {
      const method = lessonForm.id ? "PUT" : "POST";
      const url = lessonForm.id
        ? `${API_BASE}/lessons/${lessonForm.id}`
        : `${API_BASE}/lessons`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save lesson.");

      const lessonId = lessonForm.id || data.lesson?.id;
      const videoLink = lessonForm.videoLink.trim();
      if (videoLink && lessonId) {
        const videoRes = await fetch(`${API_BASE}/videos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: lessonId,
            title: lessonForm.videoTitle.trim() || lessonForm.title.trim(),
            link: videoLink,
            duration_minutes: lessonForm.videoDuration || null,
            description: lessonForm.videoDescription || null,
            is_free: lessonForm.videoIsFree,
            order_index: 1,
          }),
        });
        const videoData = await videoRes.json().catch(() => ({}));
        if (!videoRes.ok) {
          throw new Error(videoData.error || "Lesson saved, but video failed.");
        }
      }

      resetLessonForm(false);
      setLessonMessage(
        videoLink
          ? lessonForm.id
            ? "Lesson updated and video added."
            : "Lesson created with video."
          : lessonForm.id
            ? "Lesson updated."
            : "Lesson created.",
      );
      refreshLessons();
    } catch (err) {
      setLessonMessage(err.message);
    }
  };

  const deleteLesson = async (id) => {
    if (!window.confirm("Delete this lesson? Videos must be removed first.")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/lessons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not delete lesson.");
      refreshLessons();
    } catch (err) {
      alert(err.message);
    }
  };

  const recentUsers = [...users]
    .sort((a, b) => (b.id > a.id ? 1 : -1))
    .slice(0, 5);

  // ── Sidebar nav items ─────────────────────────────────────
  const NAV = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "teachers", label: "Teachers", icon: UserCheck },
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // ── Sidebar content (shared desktop + mobile) ─────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <img src={logo} alt="LearnFlow Logo" className="w-full h-full" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">
              Elearning
            </p>
            <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
            {item.id === "users" && students.length > 0 && (
              <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {students.length}
              </span>
            )}
            {activeTab === item.id && item.id !== "users" && (
              <ChevronRight className="h-3.5 w-3.5 ml-auto" />
            )}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
            {displayUser.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {displayUser.name || "Admin"}
            </p>
            <p className="text-slate-500 text-xs truncate">
              {displayUser.email}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div
      className={`min-h-screen bg-slate-950 text-white ${
        adminSettings.themeMode === "light" ? "admin-dashboard-light" : ""
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-center mb-1">
              Delete user?
            </h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              This will permanently remove the account. They won't be able to
              log in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View user modal ── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white font-bold">User Details</h3>
              <button
                onClick={() => setViewUser(null)}
                className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                {viewUser.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-white font-semibold">{viewUser.name}</p>
                <p className="text-slate-400 text-xs">{viewUser.email}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                ["Role", viewUser.role],
                ["Major", viewUser.major || "—"],
                [
                  "Academic Year",
                  viewUser.startYear
                    ? `Year ${getCurrentAcademicYear(viewUser.startYear)}`
                    : "—",
                ],
                [
                  "Study Period",
                  viewUser.startYear && viewUser.endYear
                    ? `${viewUser.startYear} - ${viewUser.endYear}`
                    : "—",
                ],
                ["Joined", viewUser.joinDate || "—"],
                ["Courses Enrolled", viewUser.coursesEnrolled ?? 0],
                ["Progress", `${viewUser.progress ?? 0}%`],
                ["Certificates", viewUser.certificates ?? 0],
                [
                  "Achievements",
                  (viewUser.achievements || []).join(", ") || "—",
                ],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 border-b border-slate-800"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-200 font-medium capitalize">
                    {val}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setViewUser(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar (fixed, hidden on mobile) ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-30 flex-col">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar (slide-in drawer) ── */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col md:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button inside mobile drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main className="md:ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold text-white truncate">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "users" && "Student Management"}
                {activeTab === "teachers" && "Teacher Management"}
                {(activeTab === "lessons" || activeTab === "Courses") &&
                  "Lesson Management"}
                {activeTab === "settings" && "System Settings"}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">
                Welcome back, {displayUser.name?.split(" ")[0] || "Admin"} 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={refreshUsers}
              title="Refresh"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="relative">
              <Bell className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
              {newToday > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <div className="w-px h-5 bg-slate-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-indigo-300 text-xs font-semibold">
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Page body */}
        <div className="px-4 md:px-8 py-5 md:py-6">
          {/* API error */}
          {apiError && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{apiError}</span>
              <button
                onClick={refreshUsers}
                className="text-xs underline hover:no-underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mb-4 flex items-center gap-2 text-slate-500 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading users...
            </div>
          )}

          {/* ── Overview ── */}
          {activeTab === "overview" && (
            <div className="space-y-5 md:space-y-6">
              {/* Stats: 2-col mobile → 4-col lg */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 hover:border-slate-600 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${s.light} flex items-center justify-center`}
                      >
                        <s.icon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <span className="text-emerald-400 text-[10px] md:text-xs font-semibold bg-emerald-500/10 px-1.5 md:px-2 py-0.5 rounded-full">
                        {s.delta}
                      </span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {s.value}
                    </p>
                    <p className="text-slate-500 text-[11px] md:text-xs mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent sign-ups */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-sm md:text-base">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Recent Sign-ups
                  <span className="ml-auto text-xs text-slate-500 font-normal">
                    Last {recentUsers.length} accounts
                  </span>
                </h2>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <UserX className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      No users registered yet.
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      New accounts will appear here instantly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">
                            {u.name}
                          </p>
                          <p className="text-slate-500 text-xs truncate">
                            {u.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span className="text-slate-500 text-xs whitespace-nowrap hidden sm:inline">
                            {u.joinDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Users Tab ── */}
          {activeTab === "users" && (
            <div className="space-y-4 md:space-y-5">
              <form
                onSubmit={createAccount}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Student
                    </label>
                    <input
                      value={studentForm.name}
                      onChange={(e) => updateStudentForm("name", e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Major
                    </label>
                    <select
                      value={studentForm.major}
                      onChange={(e) => updateStudentForm("major", e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      {MAJORS.map((major) => (
                        <option key={major}>{major}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Start
                    </label>
                    <input
                      type="number"
                      value={studentForm.startYear}
                      onChange={(e) =>
                        updateStudentForm("startYear", Number(e.target.value))
                      }
                      className="w-24 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      End
                    </label>
                    <input
                      type="number"
                      value={studentForm.endYear}
                      onChange={(e) =>
                        updateStudentForm("endYear", Number(e.target.value))
                      }
                      className="w-24 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Year
                    </label>
                    <div className="w-24 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm">
                      Year {getCurrentAcademicYear(studentForm.startYear)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Password
                    </label>
                    <input
                      value={studentForm.password}
                      onChange={(e) =>
                        updateStudentForm("password", e.target.value)
                      }
                      className="w-36 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500">
                    <Plus className="h-4 w-4" />
                    Create student
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  {generatedEmailPreview
                    ? `Generated email: ${generatedEmailPreview}`
                    : "Enter account details to preview the generated email."}
                  {studentMessage && (
                    <span className="ml-3 text-indigo-300">
                      {studentMessage}
                    </span>
                  )}
                </div>
              </form>

              {/* Search + count */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <span className="text-slate-500 text-sm shrink-0">
                  {filtered.length} of {students.length} students
                </span>
              </div>

              {students.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-16">
                  <UserX className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    No students registered yet.
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    When a student account is created it will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* ── Desktop: table (md+) ── */}
                  <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/50">
                          {[
                            "Name",
                            "Email",
                            "Role",
                            "Major",
                            "Year",
                            "Joined",
                            "Actions",
                          ].map((h) => (
                            <th
                              key={h}
                              className="py-3 px-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                  {u.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <span className="text-white text-sm font-medium">
                                  {u.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-slate-400 text-sm">
                              {u.email}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-slate-400 text-sm">
                              {u.major || "—"}
                            </td>
                            <td className="py-3.5 px-5">
                              {["student", "client"].includes(u.role) ? (
                                <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs">
                                  Year{" "}
                                  {getCurrentAcademicYear(
                                    u.startYear || new Date().getFullYear(),
                                  )}
                                </span>
                              ) : (
                                <span className="text-slate-500 text-sm">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-slate-400 text-sm">
                              {u.joinDate || "—"}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewUser(u)}
                                  className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(u.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Mobile: card list (< md) ── */}
                  <div className="md:hidden space-y-3">
                    {filtered.map((u) => (
                      <div
                        key={u.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
                      >
                        {/* Header row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">
                              {u.name}
                            </p>
                            <p className="text-slate-500 text-xs truncate">
                              {u.email}
                            </p>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setViewUser(u)}
                              className="p-2 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(u.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize font-semibold">
                            {u.role}
                          </span>
                          <span className="text-slate-500">
                            Joined:{" "}
                            <span className="text-slate-300">
                              {u.joinDate || "—"}
                            </span>
                          </span>
                          <span className="text-slate-500">
                            Major:{" "}
                            <span className="text-slate-300">
                              {u.major || "—"}
                            </span>
                          </span>
                          {["student", "client"].includes(u.role) && (
                            <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs">
                              Year{" "}
                              {getCurrentAcademicYear(
                                u.startYear || new Date().getFullYear(),
                              )}
                            </span>
                          )}
                          {/* Progress bar */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                                style={{ width: `${u.progress ?? 0}%` }}
                              />
                            </div>
                            <span className="text-slate-400 shrink-0">
                              {u.progress ?? 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Teachers Tab ── */}
          {activeTab === "teachers" && (
            <div className="space-y-5">
              <form
                onSubmit={createTeacher}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Teacher name
                    </label>
                    <input
                      value={teacherForm.name}
                      onChange={(e) => updateTeacherForm("name", e.target.value)}
                      placeholder="teachername"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) =>
                        updateTeacherForm("email", e.target.value)
                      }
                      placeholder={teacherEmailPreview || "teacher@gmail.com"}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Major
                    </label>
                    <select
                      value={teacherForm.major}
                      onChange={(e) => updateTeacherForm("major", e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      {MAJORS.map((major) => (
                        <option key={major}>{major}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Password
                    </label>
                    <input
                      value={teacherForm.password}
                      onChange={(e) =>
                        updateTeacherForm("password", e.target.value)
                      }
                      className="w-40 px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500">
                    <Plus className="h-4 w-4" />
                    Create teacher
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  {teacherEmailPreview
                    ? `Generated email: ${teacherEmailPreview}`
                    : "Type a teacher name to preview the generated email."}
                  {teacherMessage && (
                    <span className="ml-3 text-indigo-300">
                      {teacherMessage}
                    </span>
                  )}
                </div>
              </form>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold">Teachers</h2>
                    <p className="text-slate-500 text-xs">
                      {teachers.length} teacher accounts
                    </p>
                  </div>
                  <button
                    onClick={refreshUsers}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50">
                        {["Name", "Email", "Major", "Joined", "Actions"].map(
                          (header) => (
                            <th
                              key={header}
                              className="py-3 px-5 text-left text-xs font-bold text-slate-400 uppercase"
                            >
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr
                          key={teacher.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                {teacher.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <span className="text-white text-sm font-medium">
                                {teacher.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-400 text-sm">
                            {teacher.email}
                          </td>
                          <td className="py-3.5 px-5">
                            <select
                              value={teacher.major || "ITE"}
                              onChange={(e) =>
                                updateUserMajor(teacher, e.target.value)
                              }
                              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                            >
                              {MAJORS.map((major) => (
                                <option key={major}>{major}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-5 text-slate-400 text-sm">
                            {teacher.joinDate || "—"}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewUser(teacher)}
                                className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(teacher.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                title="Delete teacher"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {teachers.length === 0 && (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No teacher accounts yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Courses Tab ── */}
          {(activeTab === "lessons" || activeTab === "courses") && (
            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-5">
              <form
                onSubmit={saveLesson}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold flex items-center gap-2">
                    {lessonForm.id ? (
                      <Edit3 className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Plus className="h-4 w-4 text-indigo-400" />
                    )}
                    {lessonForm.id ? "Edit Lesson" : "Create Lesson"}
                  </h2>
                  {lessonForm.id && (
                    <button
                      type="button"
                      onClick={resetLessonForm}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    value={lessonForm.title}
                    onChange={(e) => updateLessonForm("title", e.target.value)}
                    placeholder="Lesson title"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) =>
                      updateLessonForm("description", e.target.value)
                    }
                    placeholder="Short description"
                    rows={3}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={lessonForm.major}
                      onChange={(e) => updateLessonForm("major", e.target.value)}
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      {MAJORS.map((major) => (
                        <option key={major}>{major}</option>
                      ))}
                    </select>
                    <select
                      value={lessonForm.level}
                      onChange={(e) => updateLessonForm("level", e.target.value)}
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      {LEVELS.map((level) => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={lessonForm.category_id}
                      onChange={(e) =>
                        updateLessonForm("category_id", e.target.value)
                      }
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="">Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={lessonForm.semester_id}
                      onChange={(e) =>
                        updateLessonForm("semester_id", e.target.value)
                      }
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="">Semester</option>
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.year_name} / {semester.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      value={lessonForm.credit}
                      onChange={(e) =>
                        updateLessonForm("credit", Number(e.target.value))
                      }
                      placeholder="Credits"
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                    <input
                      type="number"
                      value={lessonForm.hours}
                      onChange={(e) =>
                        updateLessonForm("hours", Number(e.target.value))
                      }
                      placeholder="Hours"
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                    <select
                      value={lessonForm.color}
                      onChange={(e) => updateLessonForm("color", e.target.value)}
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      {COLORS.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={lessonForm.is_published}
                      onChange={(e) =>
                        updateLessonForm("is_published", e.target.checked)
                      }
                    />
                    Published
                  </label>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        Add first video
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Optional. Paste a YouTube or video URL to attach it to
                        this lesson.
                      </p>
                    </div>
                    <input
                      value={lessonForm.videoLink}
                      onChange={(e) =>
                        updateLessonForm("videoLink", e.target.value)
                      }
                      placeholder="Video link"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      value={lessonForm.videoTitle}
                      onChange={(e) =>
                        updateLessonForm("videoTitle", e.target.value)
                      }
                      placeholder="Video title"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={lessonForm.videoDuration}
                        onChange={(e) =>
                          updateLessonForm("videoDuration", e.target.value)
                        }
                        placeholder="Minutes"
                        className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={lessonForm.videoIsFree}
                          onChange={(e) =>
                            updateLessonForm("videoIsFree", e.target.checked)
                          }
                        />
                        Free preview
                      </label>
                    </div>
                    <textarea
                      value={lessonForm.videoDescription}
                      onChange={(e) =>
                        updateLessonForm("videoDescription", e.target.value)
                      }
                      placeholder="Video description"
                      rows={2}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500">
                    <Save className="h-4 w-4" />
                    {lessonForm.id ? "Save lesson" : "Create lesson"}
                  </button>
                  {lessonMessage && (
                    <p className="text-xs text-indigo-300">{lessonMessage}</p>
                  )}
                </div>
              </form>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold">All Lessons</h2>
                    <p className="text-slate-500 text-xs">
                      {filteredLessons.length} of {lessons.length} lessons
                    </p>
                  </div>
                  <button
                    onClick={refreshLessons}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Filter by major
                    </label>
                    <select
                      value={lessonMajorFilter}
                      onChange={(e) => setLessonMajorFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="all">All majors</option>
                      {MAJORS.map((major) => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Filter by year
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setLessonYearFilter("all")}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          lessonYearFilter === "all"
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        All years
                      </button>
                      {years.map((year) => (
                        <button
                          type="button"
                          key={year.id}
                          onClick={() => setLessonYearFilter(String(year.id))}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                            String(lessonYearFilter) === String(year.id)
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          {year.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLessonMajorFilter("all");
                      setLessonYearFilter("all");
                    }}
                    className="self-end px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800"
                  >
                    Clear
                  </button>
                </div>

                {lessonError && (
                  <div className="m-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{lessonError}</span>
                    <button
                      onClick={refreshLessons}
                      className="text-xs underline hover:no-underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50">
                        {["Lesson", "Major", "Year", "Status", "Actions"].map(
                          (header) => (
                            <th
                              key={header}
                              className="py-3 px-5 text-left text-xs font-bold text-slate-400 uppercase"
                            >
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLessons.map((lesson) => (
                        <tr
                          key={lesson.id}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <span
                                className="h-9 w-9 rounded-xl"
                                style={{
                                  background: lesson.color || "#2563eb",
                                }}
                              />
                              <div>
                                <p className="text-white text-sm font-semibold">
                                  {lesson.title}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  {lesson.category || "No category"} ·{" "}
                                  {lesson.semester || "No semester"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-300 text-sm">
                            {lesson.major || "—"}
                          </td>
                          <td className="py-3.5 px-5 text-slate-300 text-sm">
                            {lesson.year || "—"}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                lesson.is_published
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {lesson.is_published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => editLesson(lesson)}
                                className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400"
                                title="Edit lesson"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteLesson(lesson.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                title="Delete lesson"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLessons.length === 0 && (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No lessons match these filters.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Settings Tab ── */}
          {activeTab === "settings" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-white font-bold">System Status</h2>
                      <p className="text-slate-500 text-xs">
                        Backend and database health
                      </p>
                    </div>
                    <button
                      onClick={refreshHealth}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">API</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          health?.ok
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {health?.ok ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">API URL</span>
                      <span className="text-slate-300 text-xs">{API_BASE}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">DB lessons</span>
                      <span className="text-slate-300">
                        {health?.lessons ?? "—"}
                      </span>
                    </div>
                    {health?.error && (
                      <p className="text-red-400 text-xs">{health.error}</p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h2 className="text-white font-bold mb-4">Accounts</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["All users", users.length],
                      ["Teachers", teachers.length],
                      [
                        "Students",
                        users.filter((u) =>
                          ["student", "client"].includes(u.role),
                        ).length,
                      ],
                      ["Admins", users.filter((u) => u.role === "admin").length],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-slate-950 border border-slate-800 p-3"
                      >
                        <p className="text-slate-500 text-xs">{label}</p>
                        <p className="text-white text-xl font-bold mt-1">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h2 className="text-white font-bold mb-4">Lessons</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["All lessons", lessons.length],
                      [
                        "Published",
                        lessons.filter((lesson) => lesson.is_published).length,
                      ],
                      [
                        "Drafts",
                        lessons.filter((lesson) => !lesson.is_published).length,
                      ],
                      ["Years", years.length],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-slate-950 border border-slate-800 p-3"
                      >
                        <p className="text-slate-500 text-xs">{label}</p>
                        <p className="text-white text-xl font-bold mt-1">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-white font-bold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-400" />
                      Appearance & Profile
                    </h2>
                    <p className="text-slate-500 text-xs">
                      Saved on this browser and applied to your admin session.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Theme
                    </label>
                    <select
                      value={adminSettings.themeMode}
                      onChange={(e) =>
                        updateAdminSetting("themeMode", e.target.value)
                      }
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="dark">Dark mode</option>
                      <option value="light">Light mode</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Profile name
                    </label>
                    <input
                      value={adminSettings.profileName}
                      onChange={(e) =>
                        updateAdminSetting("profileName", e.target.value)
                      }
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Profile email
                    </label>
                    <input
                      type="email"
                      value={adminSettings.profileEmail}
                      onChange={(e) =>
                        updateAdminSetting("profileEmail", e.target.value)
                      }
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-white font-bold flex items-center gap-2">
                      <Settings className="h-4 w-4 text-indigo-400" />
                      Dashboard Defaults
                    </h2>
                    <p className="text-slate-500 text-xs">
                      These settings apply to new student, teacher, and lesson
                      forms.
                    </p>
                  </div>
                  <button
                    onClick={saveAdminSettings}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
                  >
                    <Save className="h-4 w-4" />
                    Save settings
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Default major
                    </label>
                    <select
                      value={adminSettings.defaultMajor}
                      onChange={(e) =>
                        updateAdminSetting("defaultMajor", e.target.value)
                      }
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      {MAJORS.map((major) => (
                        <option key={major}>{major}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={adminSettings.publishNewLessons}
                      onChange={(e) =>
                        updateAdminSetting(
                          "publishNewLessons",
                          e.target.checked,
                        )
                      }
                    />
                    Publish new lessons
                  </label>
                  <label className="flex items-center gap-3 rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={adminSettings.compactTables}
                      onChange={(e) =>
                        updateAdminSetting("compactTables", e.target.checked)
                      }
                    />
                    Compact tables
                  </label>
                </div>

                {settingsMessage && (
                  <p className="text-indigo-300 text-sm mt-4">
                    {settingsMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .admin-dashboard-light {
          background: #f8fafc !important;
          color: #0f172a !important;
        }

        .admin-dashboard-light [class*="bg-slate-950"],
        .admin-dashboard-light [class*="bg-slate-900"] {
          background-color: #ffffff !important;
        }

        .admin-dashboard-light [class*="bg-slate-800"] {
          background-color: #f1f5f9 !important;
        }

        .admin-dashboard-light [class*="border-slate-800"],
        .admin-dashboard-light [class*="border-slate-700"] {
          border-color: #cbd5e1 !important;
        }

        .admin-dashboard-light [class*="text-white"],
        .admin-dashboard-light [class*="text-slate-200"],
        .admin-dashboard-light [class*="text-slate-300"] {
          color: #0f172a !important;
        }

        .admin-dashboard-light [class*="text-slate-400"],
        .admin-dashboard-light [class*="text-slate-500"] {
          color: #475569 !important;
        }

        .admin-dashboard-light input,
        .admin-dashboard-light select,
        .admin-dashboard-light textarea {
          background-color: #ffffff !important;
          color: #0f172a !important;
        }

        .admin-dashboard-light input::placeholder,
        .admin-dashboard-light textarea::placeholder {
          color: #64748b !important;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
