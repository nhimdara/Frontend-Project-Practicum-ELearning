import { getStoredTheme } from "./dashboardUtils";

export const MAJORS = ["ITE", "IT", "Mathematics"];
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const COLORS = [
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
];

export const DEFAULT_ADMIN_SETTINGS = {
  defaultMajor: "ITE",
  publishNewLessons: true,
  compactTables: false,
  themeMode: getStoredTheme(),
  profileName: "",
  profileEmail: "",
};

export const emptyStudentForm = {
  name: "",
  major: "ITE",
  startYear: new Date().getFullYear(),
  endYear: new Date().getFullYear() + 4,
  password: "Student@123",
};

export const emptyTeacherForm = {
  name: "",
  email: "",
  major: "ITE",
  password: "Teacher@123",
};

export const emptyLessonForm = {
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

export const emptyProjectForm = {
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
