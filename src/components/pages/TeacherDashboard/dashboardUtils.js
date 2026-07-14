export const TEACHER_APPROVED_TAG = "teacher-approved";
export const PROJECT_MAJOR_PREFIX = "major:";

export const normalizeProjectTags = (tags) =>
  Array.isArray(tags)
    ? tags
    : String(tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

export const getProjectMajor = (project) => {
  const explicitMajor = project.major || project.student_major;
  if (explicitMajor) return explicitMajor;
  const majorTag = normalizeProjectTags(project.tags).find((tag) =>
    tag.startsWith(PROJECT_MAJOR_PREFIX),
  );
  return majorTag ? majorTag.slice(PROJECT_MAJOR_PREFIX.length) : "";
};

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

export const applyStoredTheme = (theme) => {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark-mode", isDark);

  try {
    const settings = JSON.parse(
      localStorage.getItem("learnflow_settings") || "{}",
    );
    localStorage.setItem(
      "learnflow_settings",
      JSON.stringify({ ...settings, theme }),
    );
  } catch {
    localStorage.setItem("learnflow_settings", JSON.stringify({ theme }));
  }
};

export const extractYouTubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const getYouTubeThumbnail = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

export const getYouTubeEmbedUrl = (videoId) =>
  `https://www.youtube.com/embed/${videoId}`;

export const dedupeVideosByLessonSlot = (videos = []) => {
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
      Number(a.lesson_id) - Number(b.lesson_id) ||
      Number(a.order_index || 1) - Number(b.order_index || 1) ||
      Number(a.id) - Number(b.id),
  );
};
