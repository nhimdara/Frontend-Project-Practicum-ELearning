// ─────────────────────────────────────────────────────────────
//  AdminDashboard.jsx — responsive version
//  • Collapsible sidebar with hamburger on mobile
//  • Stats grid: 2-col on mobile → 4-col on lg
//  • Users table → card list on mobile (< md)
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { API_BASE_URL } from "../../config/api";
import Certificates from "./Profile/Certificates";
import ExamQuestionForm from "./ExamQuestionForm";
import {
  Shield,
  Users,
  BookOpen,
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
  FolderKanban,
  Award,
  ClipboardCheck,
  Download,
} from "lucide-react";
import logo from "./../assets/image/logo.png";

const API_BASE = API_BASE_URL;
const TEACHER_APPROVED_TAG = "teacher-approved";
const PROJECT_MAJOR_PREFIX = "major:";
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

const getStoredTheme = () => {
  try {
    return JSON.parse(localStorage.getItem("learnflow_settings") || "{}").theme || "light";
  } catch {
    return "light";
  }
};

const applyThemeMode = (theme) => {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark-mode", isDark);
  try {
    localStorage.setItem("learnflow_settings", JSON.stringify({ theme }));
  } catch {}
};

function getCurrentAcademicYear(startYear) {
  const start = Number.parseInt(startYear, 10);
  if (Number.isNaN(start)) return 1;
  return Math.min(4, Math.max(1, new Date().getFullYear() - start + 1));
}

const DEFAULT_ADMIN_SETTINGS = {
  defaultMajor: "ITE",
  publishNewLessons: true,
  compactTables: false,
  themeMode: getStoredTheme(),
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
  videoId: null,
  videoTitle: "",
  videoLink: "",
  videoDuration: "",
  videoDescription: "",
  videoIsFree: true,
};

const emptyProjectForm = {
  id: null,
  title: "",
  description: "",
  image: "",
  tags: "",
  github_url: "",
  live_url: "",
  featured: false,
  is_active: true,
  teacher_approved: true,
  admin_approved: true,
  approval_status: "approved",
};

const isProjectActive = (project) =>
  project.is_active !== false &&
  project.is_active !== 0 &&
  project.is_active !== "0";

const isTeacherApprovedProject = (project) =>
  project.teacher_approved === true ||
  project.teacher_approved === 1 ||
  project.teacher_approved === "1" ||
  project.approval_status === "admin_pending" ||
  project.approval_status === "approved" ||
  (Array.isArray(project.tags)
    ? project.tags.includes(TEACHER_APPROVED_TAG)
    : String(project.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .includes(TEACHER_APPROVED_TAG)) ||
  isProjectActive(project);

const AdminDashboard = ({ user, onLogout }) => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "overview");
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
  const [lessonStatusFilter, setLessonStatusFilter] = useState("all");
  const [lessonSearch, setLessonSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [projectMessage, setProjectMessage] = useState("");
  const [projectError, setProjectError] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [health, setHealth] = useState(null);
  const [examReportData, setExamReportData] = useState({
    major: "",
    questions: [],
  });
  const [certificateReportData, setCertificateReportData] = useState({
    selectedMajor: "all",
    certificates: [],
  });
  const [adminSettings, setAdminSettings] = useState(() => {
    try {
      const globalTheme = getStoredTheme();
      const saved = JSON.parse(
        localStorage.getItem("learnflow_admin_settings") || "{}",
      );
      return {
        ...DEFAULT_ADMIN_SETTINGS,
        themeMode: globalTheme,
        profileName: user?.name || "",
        profileEmail: user?.email || "",
        ...saved,
        themeMode: saved.themeMode || globalTheme,
      };
    } catch {
      return {
        ...DEFAULT_ADMIN_SETTINGS,
        themeMode: getStoredTheme(),
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

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  useEffect(() => {
    applyThemeMode(adminSettings.themeMode);
  }, [adminSettings.themeMode]);

  // ── Fetch users ───────────────────────────────────────────
  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API_BASE}/users`);
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

  const refreshProjects = useCallback(async () => {
    setProjectError("");
    try {
      const res = await fetch(`${API_BASE}/projects?include_inactive=1`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setProjectError("Could not load projects from database.");
      console.error("fetchProjects:", err.message);
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
    refreshProjects();
    refreshReferences();
    refreshHealth();
  }, [
    refreshUsers,
    refreshLessons,
    refreshProjects,
    refreshReferences,
    refreshHealth,
  ]);

  // Close sidebar when route changes on mobile
  const handleTabChange = (id) => {
    setActiveTab(id);
    refreshUsers();
    refreshLessons();
    refreshProjects();
    setSidebarOpen(false);
  };

  // ── Derived stats ─────────────────────────────────────────
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status !== "inactive").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const newToday = users.filter((u) => u.joinDate === todayStr).length;
  const isLessonPublished = (lesson) =>
    lesson.is_published === true ||
    lesson.is_published === 1 ||
    lesson.is_published === "1";
  const publishedLessonCount = lessons.filter(isLessonPublished).length;
  const draftLessonCount = lessons.length - publishedLessonCount;

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
      delta: `${publishedLessonCount} live`,
      icon: BookOpen,
      light: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Projects",
      value: projects.length,
      delta: `${projects.filter((project) => project.featured).length} featured`,
      icon: FolderKanban,
      light: "bg-amber-50 text-amber-600",
    },
  ];

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
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
  const selectedYear = years.find(
    (year) => String(year.id) === String(lessonYearFilter),
  );
  const lessonSearchText = lessonSearch.trim().toLowerCase();
  const filteredLessons = lessons.filter((lesson) => {
    const published = isLessonPublished(lesson);
    const matchesMajor =
      lessonMajorFilter === "all" || lesson.major === lessonMajorFilter;
    const matchesYear =
      lessonYearFilter === "all" ||
      String(lesson.year_id) === String(lessonYearFilter);
    const matchesStatus =
      lessonStatusFilter === "all" ||
      (lessonStatusFilter === "published" && published) ||
      (lessonStatusFilter === "draft" && !published);
    const searchable = [
      lesson.title,
      lesson.description,
      lesson.major,
      lesson.level,
      lesson.category,
      lesson.semester,
      lesson.year,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !lessonSearchText || searchable.includes(lessonSearchText);

    return matchesMajor && matchesYear && matchesStatus && matchesSearch;
  });
  const lessonFilterCount = [
    lessonMajorFilter !== "all",
    lessonYearFilter !== "all",
    lessonStatusFilter !== "all",
    Boolean(lessonSearchText),
  ].filter(Boolean).length;
  const filteredProjects = projects.filter((project) => {
    const searchText = projectSearch.toLowerCase();
    const tagText = Array.isArray(project.tags)
      ? project.tags.join(" ")
      : project.tags || "";
    const matchesSearch =
      project.title?.toLowerCase().includes(searchText) ||
      project.description?.toLowerCase().includes(searchText) ||
      tagText.toLowerCase().includes(searchText);
    const isActive = isProjectActive(project);
    const matchesStatus =
      projectStatusFilter === "all" ||
      (projectStatusFilter === "active" && isActive) ||
      (projectStatusFilter === "hidden" && !isActive) ||
      (projectStatusFilter === "featured" && project.featured);
    return matchesSearch && matchesStatus;
  });

  const getActiveReport = () => {
    const generatedAt = new Date().toLocaleString();

    if (activeTab === "overview") {
      return {
        name: "dashboard-overview",
        title: "Dashboard Overview Report",
        headers: ["Metric", "Value", "Details"],
        rows: [
          ["Registered Users", totalUsers, `${newToday} joined today`],
          ["Active Users", activeUsers, `${totalUsers - activeUsers} inactive`],
          ["Students", students.length, "Student and client accounts"],
          ["Teachers", teachers.length, "Teacher accounts"],
          ["Lessons", lessons.length, `${publishedLessonCount} published`],
          ["Projects", projects.length, `${projects.filter((project) => project.featured).length} featured`],
          ["Generated", generatedAt, displayUser.name],
        ],
      };
    }

    if (activeTab === "users") {
      return {
        name: "student-report",
        title: "Student Management Report",
        headers: [
          "ID",
          "Name",
          "Email",
          "Major",
          "Academic Year",
          "Status",
          "Joined",
          "Progress",
        ],
        rows: filtered.map((student) => [
          student.id,
          student.name,
          student.email,
          student.major || "",
          getCurrentAcademicYear(student.startYear || new Date().getFullYear()),
          student.status || "active",
          student.joinDate || "",
          Number(student.progress ?? 0) / 100,
        ]),
      };
    }

    if (activeTab === "teachers") {
      return {
        name: "teacher-report",
        title: "Teacher Management Report",
        headers: ["ID", "Name", "Email", "Major", "Status", "Joined"],
        rows: teachers.map((teacher) => [
          teacher.id,
          teacher.name,
          teacher.email,
          teacher.major || "",
          teacher.status || "active",
          teacher.joinDate || "",
        ]),
      };
    }

    if (activeTab === "lessons" || activeTab === "courses") {
      return {
        name: "lesson-report",
        title: "Lesson Management Report",
        headers: [
          "ID",
          "Title",
          "Major",
          "Year",
          "Semester",
          "Category",
          "Level",
          "Credits",
          "Hours",
          "Status",
        ],
        rows: filteredLessons.map((lesson) => [
          lesson.id,
          lesson.title,
          lesson.major || "",
          lesson.year || "",
          lesson.semester || "",
          lesson.category || "",
          lesson.level || "",
          lesson.credit ?? "",
          lesson.hours ?? "",
          isLessonPublished(lesson) ? "Published" : "Draft",
        ]),
      };
    }

    if (activeTab === "projects") {
      return {
        name: "project-report",
        title: "Project Management Report",
        headers: [
          "ID",
          "Title",
          "Tags",
          "Status",
          "Featured",
          "Approval",
          "GitHub URL",
          "Live URL",
        ],
        rows: filteredProjects.map((project) => [
          project.id,
          project.title,
          Array.isArray(project.tags) ? project.tags.join(", ") : project.tags || "",
          isProjectActive(project) ? "Active" : "Hidden",
          project.featured ? "Yes" : "No",
          project.approval_status || "",
          project.github_url || project.github || "",
          project.live_url || project.demo_url || "",
        ]),
      };
    }

    if (activeTab === "exams") {
      return {
        name: `exam-question-report-${examReportData.major || "all"}`,
        title: `${examReportData.major || "All Majors"} Exam Question Report`,
        headers: [
          "No.",
          "Major",
          "Question",
          "Option A",
          "Option B",
          "Option C",
          "Option D",
          "Correct Answer",
        ],
        rows: (examReportData.questions || []).map((question, index) => {
          const options = Array.isArray(question.options)
            ? question.options.slice(0, 4)
            : [];
          while (options.length < 4) options.push("");
          const correctIndex = Math.min(
            3,
            Math.max(0, Number(question.correctAnswer ?? 0)),
          );
          const correctOption = options[correctIndex] || "";
          return [
            index + 1,
            examReportData.major || "",
            question.question || "",
            ...options,
            `${String.fromCharCode(65 + correctIndex)}${correctOption ? ` - ${correctOption}` : ""}`,
          ];
        }),
      };
    }

    if (activeTab === "certificates") {
      return {
        name: `certificate-report-${certificateReportData.selectedMajor || "all"}`,
        title: "Certificate Management Report",
        headers: [
          "ID",
          "Student",
          "Email",
          "Major",
          "Certificate",
          "Issue Date",
          "Grade",
          "Credential ID",
          "Issuer",
        ],
        rows: (certificateReportData.certificates || []).map((certificate) => [
          certificate.id,
          certificate.studentName || "",
          certificate.studentEmail || "",
          certificate.studentMajor || certificate.examMajor || "",
          certificate.title || "",
          certificate.issueDate || "",
          certificate.grade || "",
          certificate.credentialId || "",
          certificate.issuer || "Royal University of Phnom Penh",
        ]),
      };
    }

    return null;
  };

  const generateActiveReport = async () => {
    const report = getActiveReport();
    if (!report) return;

    try {
      const landscape = report.headers.length > 6;
      const doc = new jsPDF({
        orientation: landscape ? "landscape" : "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const totalPagesPlaceholder = "{total_pages_count_string}";
      const generatedAt = new Date().toLocaleString();
      const progressIndex = report.headers.indexOf("Progress");
      const body = report.rows.map((row) =>
        row.map((value, index) => {
          if (index === progressIndex && typeof value === "number") {
            return `${Math.round(value * 100)}%`;
          }
          return value ?? "";
        }),
      );

      doc.setProperties({
        title: report.title,
        subject: "LearnFlow administration report",
        author: displayUser.name || "LearnFlow Admin",
        creator: "LearnFlow",
      });

      autoTable(doc, {
        head: [report.headers],
        body,
        startY: 118,
        margin: { top: 76, right: 30, bottom: 42, left: 30 },
        theme: "striped",
        showHead: "everyPage",
        rowPageBreak: "avoid",
        styles: {
          font: "helvetica",
          fontSize: landscape ? 7 : 8,
          textColor: [51, 65, 85],
          cellPadding: landscape ? 3.5 : 5,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "left",
          lineColor: [67, 56, 202],
          lineWidth: 0.5,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
          if (data.section !== "body") return;
          const header = report.headers[data.column.index];
          if (["ID", "Academic Year", "Credits", "Hours", "Value"].includes(header)) {
            data.cell.styles.halign = "right";
          }
          if (["Status", "Approval", "Featured"].includes(header)) {
            const value = String(data.cell.raw ?? "").toLowerCase();
            const positive = ["active", "published", "approved", "yes"].some(
              (text) => value.includes(text),
            );
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = positive ? [4, 120, 87] : [180, 83, 9];
          }
        },
        willDrawPage: (data) => {
          doc.setFillColor(30, 41, 59);
          doc.rect(0, 0, pageWidth, 60, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(17);
          doc.setTextColor(255, 255, 255);
          doc.text(report.title, 30, 30);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(203, 213, 225);
          doc.text(`LearnFlow Administration - Generated ${generatedAt}`, 30, 46);

          if (data.pageNumber === 1) {
            doc.setFillColor(238, 242, 255);
            doc.roundedRect(30, 74, 150, 29, 4, 4, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(67, 56, 202);
            doc.text("TOTAL RECORDS", 41, 86);
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text(String(report.rows.length), 41, 99);
          }
        },
        didDrawPage: (data) => {
          doc.setDrawColor(226, 232, 240);
          doc.line(30, pageHeight - 30, pageWidth - 30, pageHeight - 30);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text("LearnFlow Admin - Confidential", 30, pageHeight - 17);
          doc.text(
            `Page ${data.pageNumber} of ${totalPagesPlaceholder}`,
            pageWidth - 30,
            pageHeight - 17,
            { align: "right" },
          );
        },
      });

      if (typeof doc.putTotalPages === "function") {
        doc.putTotalPages(totalPagesPlaceholder);
      }
      const date = new Date().toISOString().slice(0, 10);
      doc.save(`${report.name}-${date}.pdf`);
    } catch (err) {
      console.error("generateReport:", err);
      alert(
        `Could not generate the PDF report.${err?.message ? ` ${err.message}` : ""}`,
      );
    }
  };

  const activeReport = getActiveReport();

  const generatedEmailPreview = (() => {
    const nameParts = studentForm.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    if (nameParts.length === 0) return "";
    const firstName = nameParts[0].slice(0, 24);
    const lastName = (nameParts.length > 1
      ? nameParts[nameParts.length - 1]
      : firstName
    ).slice(0, 24);
    const start = String(studentForm.startYear).slice(-2);
    const end = String(studentForm.endYear).slice(-2);
    return `${firstName}.${lastName}.${start}${end}@elearning.com`;
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

    const nameParts = teacherForm.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    if (nameParts.length === 0) return "";
    const firstName = nameParts[0].slice(0, 24);
    const lastName = (nameParts.length > 1
      ? nameParts[nameParts.length - 1]
      : firstName
    ).slice(0, 24);
    return `${firstName}.${lastName}.teacher@elearning.com`;
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

    applyThemeMode(adminSettings.themeMode);
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

  const editLesson = async (lesson) => {
    let firstVideo = null;
    try {
      const res = await fetch(`${API_BASE}/lessons/${lesson.id}/videos`);
      if (res.ok) {
        const videos = await res.json();
        firstVideo = videos[0] || null;
      }
    } catch (err) {
      console.error("fetchLessonVideos:", err.message);
    }

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
      videoId: firstVideo?.id || null,
      videoTitle: firstVideo?.title || "",
      videoLink: firstVideo?.link || "",
      videoDuration: firstVideo?.duration_minutes || "",
      videoDescription: firstVideo?.description || "",
      videoIsFree: firstVideo ? firstVideo.is_free !== 0 : true,
    });
    setLessonMessage("");
    setActiveTab("lessons");
  };

  const resetLessonForm = (clearMessage = true) => {
    setLessonForm({
      ...emptyLessonForm,
      major: adminSettings.defaultMajor || emptyLessonForm.major,
      is_published: adminSettings.publishNewLessons,
    });
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
      let activeVideoId = lessonForm.videoId;
      if (videoLink && lessonId) {
        const videoId = lessonForm.videoId;
        const videoRes = await fetch(
          videoId ? `${API_BASE}/videos/${videoId}` : `${API_BASE}/videos`,
          {
            method: videoId ? "PUT" : "POST",
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
          },
        );
        const videoData = await videoRes.json().catch(() => ({}));
        if (!videoRes.ok) {
          throw new Error(videoData.error || "Lesson saved, but video failed.");
        }
        activeVideoId = videoId || videoData.video?.id || null;
        if (activeVideoId) {
          const videosRes = await fetch(`${API_BASE}/lessons/${lessonId}/videos`);
          if (videosRes.ok) {
            const videos = await videosRes.json();
            await Promise.all(
              videos
                .filter((video) => video.id !== activeVideoId)
                .map((video) =>
                  fetch(`${API_BASE}/videos/${video.id}`, { method: "DELETE" }),
                ),
            );
          }
        }
      } else if (!videoLink && lessonForm.videoId) {
        const deleteVideoRes = await fetch(
          `${API_BASE}/videos/${lessonForm.videoId}`,
          {
            method: "DELETE",
          },
        );
        const deleteVideoData = await deleteVideoRes.json().catch(() => ({}));
        if (!deleteVideoRes.ok) {
          throw new Error(
            deleteVideoData.error ||
              "Lesson saved, but old video failed to delete.",
          );
        }
      }

      resetLessonForm(false);
      setLessonMessage(
        videoLink
          ? lessonForm.id
            ? lessonForm.videoId
              ? "Lesson and video updated."
              : "Lesson updated and video added."
            : "Lesson created with video."
          : lessonForm.id
            ? lessonForm.videoId
              ? "Lesson updated and video removed."
              : "Lesson updated."
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

  const updateProjectForm = (field, value) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }));
    setProjectMessage("");
  };

  const resetProjectForm = (clearMessage = true) => {
    setProjectForm(emptyProjectForm);
    if (clearMessage) setProjectMessage("");
  };

  const editProject = (project) => {
    setProjectForm({
      id: project.id,
      title: project.title || "",
      description: project.description || "",
      image: project.image || project.image_url || "",
      tags: (Array.isArray(project.tags)
        ? project.tags
        : String(project.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
      )
        .filter((tag) => tag !== TEACHER_APPROVED_TAG)
        .filter((tag) => !tag.startsWith(PROJECT_MAJOR_PREFIX))
        .join(", "),
      github_url: project.github_url || project.github || "",
      live_url: project.live_url || project.demo_url || "",
      featured: Boolean(project.featured),
      is_active: isProjectActive(project),
      teacher_approved: isTeacherApprovedProject(project),
      admin_approved: isProjectActive(project),
      approval_status: project.approval_status || (isProjectActive(project) ? "approved" : "admin_pending"),
    });
    setProjectMessage("");
    setActiveTab("projects");
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setProjectMessage("");
    try {
      const method = projectForm.id ? "PUT" : "POST";
      const url = projectForm.id
        ? `${API_BASE}/projects/${projectForm.id}`
        : `${API_BASE}/projects`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...projectForm,
          is_active: projectForm.is_active && projectForm.teacher_approved,
          admin_approved: projectForm.is_active && projectForm.teacher_approved,
          approval_status:
            projectForm.is_active && projectForm.teacher_approved
              ? "approved"
              : projectForm.teacher_approved
                ? "admin_pending"
                : "teacher_pending",
          tags: projectForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(
              (tag) =>
                tag &&
                tag !== TEACHER_APPROVED_TAG &&
                !tag.startsWith(PROJECT_MAJOR_PREFIX),
            ),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save project.");

      resetProjectForm(false);
      setProjectMessage(projectForm.id ? "Project updated." : "Project created.");
      refreshProjects();
    } catch (err) {
      setProjectMessage(err.message);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project permanently?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not delete project.");
      if (projectForm.id === id) resetProjectForm(false);
      refreshProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const approveProject = async (project) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...project,
          image: project.image || project.image_url || "",
          tags: Array.isArray(project.tags)
            ? project.tags.filter(
                (tag) =>
                  tag !== TEACHER_APPROVED_TAG &&
                  !tag.startsWith(PROJECT_MAJOR_PREFIX),
              )
            : String(project.tags || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter(
                  (tag) =>
                    tag &&
                    tag !== TEACHER_APPROVED_TAG &&
                    !tag.startsWith(PROJECT_MAJOR_PREFIX),
                ),
          github_url: project.github_url || project.github || "",
          live_url: project.live_url || project.demo_url || "",
          teacher_approved: true,
          admin_approved: true,
          approval_status: "approved",
          is_active: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not approve project.");
      setProjectMessage("Project final approved and visible.");
      refreshProjects();
    } catch (err) {
      setProjectMessage(err.message);
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
    { id: "exams", label: "Exam Questions", icon: ClipboardCheck },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // ── Sidebar content (shared desktop + mobile) ─────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <img src={logo} alt="Elearning Logo" className="w-full h-full" />
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
      className="admin-dashboard-root min-h-screen bg-slate-950 text-white"
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
                {activeTab === "exams" && "Exam Question Management"}
                {activeTab === "certificates" && "Certificate Management"}
                {activeTab === "projects" && "Project Management"}
                {activeTab === "settings" && "System Settings"}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">
                Welcome back, {displayUser.name?.split(" ")[0] || "Admin"} 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {activeReport && (
              <button
                type="button"
                onClick={generateActiveReport}
                title={`Generate ${activeReport.title}`}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Generate Report</span>
              </button>
            )}
            <button
              onClick={() => {
                refreshUsers();
                refreshLessons();
                refreshProjects();
              }}
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
                      placeholder="Student Name"
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
                      placeholder="Teacher Name"
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

          {/* Lessons Tab */}
          {(activeTab === "lessons" || activeTab === "courses") && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                      Lesson catalog
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-white">
                      Admin lessons
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-400">
                      Catalog structure, publishing state, and primary video details.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
                    {[
                      ["Total", lessons.length, "text-cyan-300"],
                      ["Published", publishedLessonCount, "text-emerald-300"],
                      ["Drafts", draftLessonCount, "text-amber-300"],
                      ["Showing", filteredLessons.length, "text-indigo-300"],
                    ].map(([label, value, tone]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-3"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {label}
                        </p>
                        <p className={`mt-1 text-xl font-bold ${tone}`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
              <form
                onSubmit={saveLesson}
                className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {lessonForm.id ? "Editing lesson" : "New lesson"}
                    </p>
                    <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-white">
                      {lessonForm.id ? (
                        <Edit3 className="h-4 w-4 text-indigo-400" />
                      ) : (
                        <Plus className="h-4 w-4 text-indigo-400" />
                      )}
                      {lessonForm.id ? "Update lesson" : "Create lesson"}
                    </h2>
                  </div>
                  {lessonForm.id && (
                    <button
                      type="button"
                      onClick={resetLessonForm}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                      title="Clear form"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Title
                      </span>
                      <input
                        value={lessonForm.title}
                        onChange={(e) =>
                          updateLessonForm("title", e.target.value)
                        }
                        placeholder="Lesson title"
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Description
                      </span>
                      <textarea
                        value={lessonForm.description}
                        onChange={(e) =>
                          updateLessonForm("description", e.target.value)
                        }
                        placeholder="Short description"
                        rows={3}
                        className="mt-1.5 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Major
                      </span>
                      <select
                        value={lessonForm.major}
                        onChange={(e) =>
                          updateLessonForm("major", e.target.value)
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                      >
                        {MAJORS.map((major) => (
                          <option key={major}>{major}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Level
                      </span>
                      <select
                        value={lessonForm.level}
                        onChange={(e) =>
                          updateLessonForm("level", e.target.value)
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                      >
                        {LEVELS.map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Category
                      </span>
                      <select
                        value={lessonForm.category_id}
                        onChange={(e) =>
                          updateLessonForm("category_id", e.target.value)
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                      >
                        <option value="">Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Semester
                      </span>
                      <select
                        value={lessonForm.semester_id}
                        onChange={(e) =>
                          updateLessonForm("semester_id", e.target.value)
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                      >
                        <option value="">Semester</option>
                        {semesters.map((semester) => (
                          <option key={semester.id} value={semester.id}>
                            {semester.year_name} / {semester.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Credits
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={lessonForm.credit}
                        onChange={(e) =>
                          updateLessonForm("credit", Number(e.target.value))
                        }
                        placeholder="Credits"
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Hours
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={lessonForm.hours}
                        onChange={(e) =>
                          updateLessonForm("hours", Number(e.target.value))
                        }
                        placeholder="Hours"
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                      />
                    </label>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Accent color
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateLessonForm("color", color)}
                          title={color}
                          aria-label={`Use color ${color}`}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                            lessonForm.color === color
                              ? "border-white ring-2 ring-indigo-400"
                              : "border-slate-700 hover:border-slate-500"
                          }`}
                          style={{ background: color }}
                        >
                          {lessonForm.color === color && (
                            <CheckCircle className="h-4 w-4 text-white drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Publishing
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[
                        ["published", true, CheckCircle],
                        ["draft", false, AlertTriangle],
                      ].map(([label, value, Icon]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            updateLessonForm("is_published", value)
                          }
                          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition ${
                            lessonForm.is_published === value
                              ? value
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                              : "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Primary video
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {lessonForm.videoId
                            ? "Video attached"
                            : "Optional first video"}
                        </p>
                      </div>
                      {lessonForm.videoId && (
                        <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                          #{lessonForm.videoId}
                        </span>
                      )}
                    </div>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Link
                      </span>
                      <input
                        value={lessonForm.videoLink}
                        onChange={(e) =>
                          updateLessonForm("videoLink", e.target.value)
                        }
                        placeholder="Video link"
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Title
                      </span>
                      <input
                        value={lessonForm.videoTitle}
                        onChange={(e) =>
                          updateLessonForm("videoTitle", e.target.value)
                        }
                        placeholder="Video title"
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Minutes
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={lessonForm.videoDuration}
                          onChange={(e) =>
                            updateLessonForm("videoDuration", e.target.value)
                          }
                          placeholder="Minutes"
                          className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                        />
                      </label>
                      <label className="mt-5 flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm font-semibold text-slate-300">
                        <input
                          type="checkbox"
                          checked={lessonForm.videoIsFree}
                          onChange={(e) =>
                            updateLessonForm("videoIsFree", e.target.checked)
                          }
                          className="h-4 w-4"
                        />
                        Free preview
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Notes
                      </span>
                      <textarea
                        value={lessonForm.videoDescription}
                        onChange={(e) =>
                          updateLessonForm(
                            "videoDescription",
                            e.target.value,
                          )
                        }
                        placeholder="Video description"
                        rows={2}
                        className="mt-1.5 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
                      />
                    </label>
                  </div>

                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
                    <Save className="h-4 w-4" />
                    {lessonForm.id ? "Save lesson" : "Create lesson"}
                  </button>
                  {lessonMessage && (
                    <div
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        /failed|error|could not|cannot/i.test(lessonMessage)
                          ? "border-red-500/20 bg-red-500/10 text-red-300"
                          : "border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
                      }`}
                    >
                      {lessonMessage}
                    </div>
                  )}
                </div>
              </form>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Catalog table
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-white">
                        Lessons
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {filteredLessons.length} of {lessons.length} lessons
                        {lessonMajorFilter !== "all" ? ` / ${lessonMajorFilter}` : ""}
                        {selectedYear ? ` / ${selectedYear.name}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {lessonFilterCount > 0 && (
                        <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                          {lessonFilterCount} active filter
                          {lessonFilterCount > 1 ? "s" : ""}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={refreshLessons}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                        title="Refresh lessons"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_220px]">
                    <label className="relative block">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={lessonSearch}
                        onChange={(e) => setLessonSearch(e.target.value)}
                        placeholder="Search lessons"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-indigo-500"
                      />
                    </label>
                    <select
                      value={lessonMajorFilter}
                      onChange={(e) => setLessonMajorFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                    >
                      <option value="all">All majors</option>
                      {MAJORS.map((major) => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-3 rounded-xl border border-slate-700 bg-slate-950 p-1">
                      {[
                        ["all", "All"],
                        ["published", "Live"],
                        ["draft", "Draft"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setLessonStatusFilter(value)}
                          className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                            lessonStatusFilter === value
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
                    <button
                      type="button"
                      onClick={() => {
                        setLessonMajorFilter("all");
                        setLessonYearFilter("all");
                        setLessonStatusFilter("all");
                        setLessonSearch("");
                      }}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                      Clear filters
                    </button>
                  </div>
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
                      <tr className="border-b border-slate-800 bg-slate-950/70">
                        {["Lesson", "Structure", "Load", "Status", "Actions"].map(
                          (header) => (
                            <th
                              key={header}
                              className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
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
                          className="border-b border-slate-800 transition hover:bg-slate-800/40"
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <span
                                className="h-10 w-10 shrink-0 rounded-xl"
                                style={{
                                  background: lesson.color || "#2563eb",
                                }}
                              />
                              <div className="min-w-0">
                                <p className="max-w-[320px] truncate text-white text-sm font-semibold">
                                  {lesson.title}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  {lesson.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="text-sm font-semibold text-slate-200">
                              {lesson.major || "No major"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {lesson.category || "No category"} /{" "}
                              {lesson.semester || "No semester"}
                            </p>
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="text-sm text-slate-300">
                              {lesson.credit || 0} credits
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {lesson.hours || 0} hours /{" "}
                              {lesson.year || "No year"}
                            </p>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isLessonPublished(lesson)
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {isLessonPublished(lesson) ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => editLesson(lesson)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                                title="Edit lesson"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteLesson(lesson.id)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
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
                    <div className="px-5 py-14 text-center">
                      <BookOpen className="mx-auto h-8 w-8 text-slate-600" />
                      <p className="mt-3 text-sm font-semibold text-slate-300">
                        No lessons found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Adjust filters or create a new lesson.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ── Certificates Tab ── */}
          {activeTab === "exams" && (
            <div className="w-full">
              <ExamQuestionForm
                user={user}
                defaultMajor={adminSettings.defaultMajor || "ITE"}
                onQuestionsChange={setExamReportData}
              />
            </div>
          )}

          {activeTab === "certificates" && (
            <Certificates
              user={user}
              onLogout={onLogout}
              embedded
              onReportDataChange={setCertificateReportData}
            />
          )}

          {/* ── Projects Tab ── */}
          {activeTab === "projects" && (
            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-5">
              <form
                onSubmit={saveProject}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold flex items-center gap-2">
                    {projectForm.id ? (
                      <Edit3 className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Plus className="h-4 w-4 text-indigo-400" />
                    )}
                    {projectForm.id ? "Edit Project" : "Create Project"}
                  </h2>
                  {projectForm.id && (
                    <button
                      type="button"
                      onClick={resetProjectForm}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    value={projectForm.title}
                    onChange={(e) => updateProjectForm("title", e.target.value)}
                    placeholder="Project title"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <textarea
                    value={projectForm.description}
                    onChange={(e) =>
                      updateProjectForm("description", e.target.value)
                    }
                    placeholder="Project description"
                    rows={4}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="url"
                    value={projectForm.image}
                    onChange={(e) => updateProjectForm("image", e.target.value)}
                    placeholder="Image URL"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    value={projectForm.tags}
                    onChange={(e) => updateProjectForm("tags", e.target.value)}
                    placeholder="Tags, separated by commas"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      value={projectForm.github_url}
                      onChange={(e) =>
                        updateProjectForm("github_url", e.target.value)
                      }
                      placeholder="GitHub URL"
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="url"
                      value={projectForm.live_url}
                      onChange={(e) =>
                        updateProjectForm("live_url", e.target.value)
                      }
                      placeholder="Live demo URL"
                      className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={projectForm.featured}
                        onChange={(e) =>
                          updateProjectForm("featured", e.target.checked)
                        }
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={projectForm.is_active}
                        disabled={!projectForm.teacher_approved}
                        onChange={(e) =>
                          updateProjectForm("is_active", e.target.checked)
                        }
                      />
                      Visible after admin approval
                    </label>
                  </div>
                  {!projectForm.teacher_approved && (
                    <p className="text-xs text-amber-300">
                      Waiting for teacher approval before admin can publish.
                    </p>
                  )}

                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500">
                    <Save className="h-4 w-4" />
                    {projectForm.id ? "Save project" : "Create project"}
                  </button>
                  {projectMessage && (
                    <p className="text-xs text-indigo-300">{projectMessage}</p>
                  )}
                </div>
              </form>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold">All Projects</h2>
                    <p className="text-slate-500 text-xs">
                      {filteredProjects.length} of {projects.length} projects
                    </p>
                  </div>
                  <button
                    onClick={refreshProjects}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search projects"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <select
                    value={projectStatusFilter}
                    onChange={(e) => setProjectStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  >
                    <option value="all">All status</option>
                    <option value="active">Visible</option>
                    <option value="hidden">Hidden</option>
                    <option value="featured">Featured</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectSearch("");
                      setProjectStatusFilter("all");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800"
                  >
                    Clear
                  </button>
                </div>

                {projectError && (
                  <div className="m-4 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{projectError}</span>
                    <button
                      onClick={refreshProjects}
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
                        {["Project", "Tags", "Views", "Status", "Actions"].map(
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
                      {filteredProjects.map((project) => {
                        const isActive = isProjectActive(project);
                        const teacherApproved = isTeacherApprovedProject(project);
                        const statusLabel = isActive
                          ? "Visible"
                          : teacherApproved
                            ? "Needs admin approval"
                            : "Needs teacher approval";
                        return (
                          <tr
                            key={project.id}
                            className="border-b border-slate-800 hover:bg-slate-800/40"
                          >
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3 min-w-[260px]">
                                {project.image ? (
                                  <img
                                    src={project.image}
                                    alt={project.title}
                                    className="h-11 w-14 rounded-xl object-cover border border-slate-800"
                                  />
                                ) : (
                                  <div className="h-11 w-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                                    <FolderKanban className="h-5 w-5 text-slate-500" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-white text-sm font-semibold truncate">
                                    {project.title}
                                  </p>
                                  <p className="text-slate-500 text-xs line-clamp-1">
                                    {project.description || "No description"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex flex-wrap gap-1.5 min-w-[180px]">
                                {(project.tags || [])
                                  .filter(
                                    (tag) =>
                                      tag !== TEACHER_APPROVED_TAG &&
                                      !tag.startsWith(PROJECT_MAJOR_PREFIX),
                                  )
                                  .slice(0, 3)
                                  .map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-300 text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {(project.tags || []).filter(
                                  (tag) =>
                                    tag !== TEACHER_APPROVED_TAG &&
                                    !tag.startsWith(PROJECT_MAJOR_PREFIX),
                                ).length === 0 && (
                                  <span className="text-slate-500 text-xs">
                                    No tags
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-slate-300 text-sm">
                              {project.view_count ?? 0}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                    isActive
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                  }`}
                                >
                                  {statusLabel}
                                </span>
                                {project.featured && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                {!isActive && teacherApproved && (
                                  <button
                                    onClick={() => approveProject(project)}
                                    className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400"
                                    title="Final approve project"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => editProject(project)}
                                  className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400"
                                  title="Edit project"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteProject(project.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                  title="Delete project"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredProjects.length === 0 && (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No projects match these filters.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
        html:not(.dark-mode) .admin-dashboard-root {
          background:
            radial-gradient(circle at top right, rgba(99,102,241,0.14), transparent 34rem),
            linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%) !important;
          color: #0f172a !important;
        }

        html:not(.dark-mode) .admin-dashboard-root [class*="bg-slate-950"],
        html:not(.dark-mode) .admin-dashboard-root [class*="bg-slate-900"] {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.96)) !important;
          box-shadow: 0 16px 38px rgba(37,56,88,0.07);
        }

        html:not(.dark-mode) .admin-dashboard-root [class*="bg-slate-800"] {
          background-color: #f1f5ff !important;
        }

        html:not(.dark-mode) .admin-dashboard-root [class*="border-slate-800"],
        html:not(.dark-mode) .admin-dashboard-root [class*="border-slate-700"] {
          border-color: #dbe6f5 !important;
        }

        html:not(.dark-mode) .admin-dashboard-root [class*="text-white"],
        html:not(.dark-mode) .admin-dashboard-root [class*="text-slate-200"],
        html:not(.dark-mode) .admin-dashboard-root [class*="text-slate-300"] {
          color: #0f172a !important;
        }

        html:not(.dark-mode) .admin-dashboard-root [class*="text-slate-400"],
        html:not(.dark-mode) .admin-dashboard-root [class*="text-slate-500"] {
          color: #475569 !important;
        }

        html:not(.dark-mode) .admin-dashboard-root header,
        html:not(.dark-mode) .admin-dashboard-root aside {
          background: rgba(255,255,255,0.88) !important;
          backdrop-filter: blur(18px);
          border-color: #dbe6f5 !important;
        }

        html:not(.dark-mode) .admin-dashboard-root aside {
          box-shadow: 12px 0 34px rgba(15,23,42,0.06);
        }

        html:not(.dark-mode) .admin-dashboard-root aside nav button:not([class*="bg-indigo-600"]):hover,
        html:not(.dark-mode) .admin-dashboard-root button[class*="hover:bg-slate-800"]:hover {
          background: #edf3ff !important;
          color: #1e293b !important;
        }

        html:not(.dark-mode) .admin-dashboard-root [class*="bg-indigo-600"],
        html:not(.dark-mode) .admin-dashboard-root [class*="bg-red-600"],
        html:not(.dark-mode) .admin-dashboard-root [class*="bg-emerald-600"],
        html:not(.dark-mode) .admin-dashboard-root [class*="from-indigo-500"],
        html:not(.dark-mode) .admin-dashboard-root [class*="from-cyan-500"],
        html:not(.dark-mode) .admin-dashboard-root [class*="from-violet-500"],
        html:not(.dark-mode) .admin-dashboard-root [class*="to-violet-600"],
        html:not(.dark-mode) .admin-dashboard-root [class*="to-indigo-600"] {
          color: #ffffff !important;
        }

        html:not(.dark-mode) .admin-dashboard-root button[class*="bg-indigo-600"],
        html:not(.dark-mode) .admin-dashboard-root .exam-question-form button[type="submit"] {
          background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
          border-color: transparent !important;
          box-shadow: 0 12px 24px rgba(79,70,229,0.22);
          color: #ffffff !important;
        }

        html:not(.dark-mode) .admin-dashboard-root button[class*="bg-red-600"] {
          background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
          color: #ffffff !important;
        }

        html:not(.dark-mode) .admin-dashboard-root table thead tr,
        html:not(.dark-mode) .admin-dashboard-root tr[class*="bg-slate-800"],
        html:not(.dark-mode) .admin-dashboard-root tr[class*="bg-slate-950"] {
          background: linear-gradient(180deg, #f7faff, #eef4ff) !important;
        }

        html:not(.dark-mode) .admin-dashboard-root tbody tr:hover,
        html:not(.dark-mode) .admin-dashboard-root [class*="hover:bg-slate-800/40"]:hover {
          background: #f3f7ff !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .rounded-2xl,
        html:not(.dark-mode) .admin-dashboard-root .rounded-xl {
          border-color: #dbe6f5;
        }

        html:not(.dark-mode) .admin-dashboard-root input[class*="pl-10"] {
          padding-left: 2.5rem !important;
        }

        html:not(.dark-mode) .admin-dashboard-root input[class*="pl-9"] {
          padding-left: 2.25rem !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root {
          color: #0f172a !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-panel,
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-card,
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .certificate-card {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.96)) !important;
          border-color: #dbe6f5 !important;
          box-shadow: 0 18px 42px rgba(37,56,88,0.09) !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-card {
          background:
            linear-gradient(135deg, rgba(255,255,255,0.98), rgba(244,247,255,0.96)) !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root h1,
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root h2,
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root h3,
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root [class*="text-white"],
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root [class*="text-slate-200"],
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root [class*="text-slate-300"] {
          color: #0f172a !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root [class*="text-slate-400"],
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root [class*="text-slate-500"],
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root [class*="text-slate-600"] {
          color: #64748b !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .student-row {
          border-color: #e6eef8 !important;
          background: rgba(255,255,255,0.64) !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .student-row:hover {
          background: #f3f7ff !important;
          box-shadow: inset 3px 0 0 #6366f1;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .major-pill,
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-btn.secondary {
          background: #ffffff !important;
          color: #334155 !important;
          border-color: #c8d7ee !important;
          box-shadow: 0 8px 18px rgba(37,56,88,0.05);
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-btn.secondary:hover {
          background: #f0f5ff !important;
          color: #0f172a !important;
          border-color: #aebff8 !important;
          transform: translateY(-1px);
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-btn.danger {
          background: #fff5f5 !important;
          color: #991b1b !important;
          border-color: #fecaca !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .students-panel [class*="border-slate-800"] {
          border-color: #dbe6f5 !important;
          background: linear-gradient(180deg, #f7faff, #f0f5ff) !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-input {
          background: #ffffff !important;
          color: #0f172a !important;
          border-color: #c8d7ee !important;
          box-shadow:
            inset 0 1px 0 rgba(15,23,42,0.03),
            0 10px 22px rgba(37,56,88,0.05);
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-input.pl-10 {
          padding-left: 2.5rem !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .student-row .text-white,
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .major-pill.active,
        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .admin-btn.primary {
          color: #ffffff !important;
        }

        html:not(.dark-mode) .admin-dashboard-root .cert-admin-root .student-row p.text-white {
          color: #0f172a !important;
        }

        html:not(.dark-mode) .admin-dashboard-root input,
        html:not(.dark-mode) .admin-dashboard-root select,
        html:not(.dark-mode) .admin-dashboard-root textarea {
          background-color: #ffffff !important;
          color: #0f172a !important;
          border-color: #c8d7ee !important;
          box-shadow:
            inset 0 1px 0 rgba(15,23,42,0.03),
            0 10px 22px rgba(37,56,88,0.04);
        }

        html:not(.dark-mode) .admin-dashboard-root input::placeholder,
        html:not(.dark-mode) .admin-dashboard-root textarea::placeholder {
          color: #64748b !important;
        }

        html.dark-mode .admin-dashboard-root {
          background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.20), transparent 30rem),
            linear-gradient(180deg, #070816 0%, #10122a 100%) !important;
          color: #f4f7ff !important;
        }

        html.dark-mode .admin-dashboard-root div[style*="background: rgb(255, 255, 255)"],
        html.dark-mode .admin-dashboard-root div[style*="background: #fff"],
        html.dark-mode .admin-dashboard-root article[style*="background: rgb(255, 255, 255)"],
        html.dark-mode .admin-dashboard-root article[style*="background: #fff"],
        html.dark-mode .admin-dashboard-root section[style*="background: rgb(255, 255, 255)"],
        html.dark-mode .admin-dashboard-root section[style*="background: #fff"] {
          background: rgba(21, 23, 51, 0.96) !important;
          border-color: #2b315f !important;
          color: #f4f7ff !important;
          box-shadow: 0 20px 54px rgba(0, 0, 0, 0.42) !important;
        }

        html.dark-mode .admin-dashboard-root h1[style*="color"],
        html.dark-mode .admin-dashboard-root h2[style*="color"],
        html.dark-mode .admin-dashboard-root h3[style*="color"],
        html.dark-mode .admin-dashboard-root p[style*="color: rgb(17, 24, 39)"],
        html.dark-mode .admin-dashboard-root p[style*="color: #111827"],
        html.dark-mode .admin-dashboard-root p[style*="color: rgb(15, 23, 42)"],
        html.dark-mode .admin-dashboard-root p[style*="color: #0f172a"],
        html.dark-mode .admin-dashboard-root span[style*="color: rgb(17, 24, 39)"],
        html.dark-mode .admin-dashboard-root span[style*="color: #111827"],
        html.dark-mode .admin-dashboard-root span[style*="color: rgb(15, 23, 42)"],
        html.dark-mode .admin-dashboard-root span[style*="color: #0f172a"] {
          color: #f4f7ff !important;
        }

        html.dark-mode .admin-dashboard-root p[style*="color: rgb(107, 114, 128)"],
        html.dark-mode .admin-dashboard-root p[style*="color: #6b7280"],
        html.dark-mode .admin-dashboard-root span[style*="color: rgb(107, 114, 128)"],
        html.dark-mode .admin-dashboard-root span[style*="color: #6b7280"],
        html.dark-mode .admin-dashboard-root p[style*="color: rgb(156, 163, 175)"],
        html.dark-mode .admin-dashboard-root p[style*="color: #9ca3af"],
        html.dark-mode .admin-dashboard-root span[style*="color: rgb(156, 163, 175)"],
        html.dark-mode .admin-dashboard-root span[style*="color: #9ca3af"] {
          color: #a8b1d6 !important;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
