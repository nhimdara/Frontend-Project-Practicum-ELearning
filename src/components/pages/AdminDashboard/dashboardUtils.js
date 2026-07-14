export const TEACHER_APPROVED_TAG = "teacher-approved";
export const PROJECT_MAJOR_PREFIX = "major:";

export const getStoredTheme = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("learnflow_settings") || "{}").theme ||
      "light"
    );
  } catch {
    return "light";
  }
};

export const applyThemeMode = (theme) => {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark-mode", isDark);
  try {
    localStorage.setItem("learnflow_settings", JSON.stringify({ theme }));
  } catch {
    // Theme persistence is best-effort.
  }
};

export const getCurrentAcademicYear = (startYear) => {
  const start = Number.parseInt(startYear, 10);
  if (Number.isNaN(start)) return 1;
  return Math.min(4, Math.max(1, new Date().getFullYear() - start + 1));
};

export const isProjectActive = (project) =>
  project.is_active !== false &&
  project.is_active !== 0 &&
  project.is_active !== "0";

export const isTeacherApprovedProject = (project) =>
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
