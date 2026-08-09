const majorCatalog = {
  ITE: { name: "Information Technology Education", icon: "💻", color: "#2563eb" },
  IT: { name: "Information Technology", icon: "🖥️", color: "#0891b2" },
  Mathematics: { name: "Mathematics", icon: "📐", color: "#7c3aed" },
};

const configuredMajorIds = String(import.meta.env.VITE_APP_MAJORS || "ITE,IT,Mathematics")
  .split(",").map((value) => value.trim()).filter(Boolean);

export const APP_CONFIG = {
  name: "Elearning",
  emailDomain: "elearning.com",
  programLengthYears: 4,
  majors: configuredMajorIds.map((id) => ({
    id,
    name: majorCatalog[id]?.name || id,
    icon: majorCatalog[id]?.icon || "🎓",
    color: majorCatalog[id]?.color || "#4f46e5",
  })),
  lessonLevels: ["Beginner", "Intermediate", "Advanced"],
};

export const MAJORS = APP_CONFIG.majors.map((major) => major.id);
export const getMajor = (id) => APP_CONFIG.majors.find((major) => major.id === id);
export const currentYear = () => new Date().getFullYear();
export const academicYearOptions = (before = 2, after = 5) =>
  Array.from({ length: before + after + 1 }, (_, index) => currentYear() - before + index);
