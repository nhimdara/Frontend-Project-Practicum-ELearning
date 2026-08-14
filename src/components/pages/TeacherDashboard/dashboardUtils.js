export const TEACHER_APPROVED_TAG = "teacher-approved";
export const PROJECT_MAJOR_PREFIX = "major:";
const TEACHER_APPEARANCE_KEY = "learnflow_teacher_appearance";

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
      JSON.parse(localStorage.getItem(TEACHER_APPEARANCE_KEY) || "{}").theme ||
      "light"
    );
  } catch {
    return "light";
  }
};

export const getStoredLiquidGlass = () => {
  try {
    return JSON.parse(
      localStorage.getItem(TEACHER_APPEARANCE_KEY) || "{}",
    ).liquidGlass !== false;
  } catch {
    return true;
  }
};

export const getStoredAccentColor = () => {
  try {
    return JSON.parse(
      localStorage.getItem(TEACHER_APPEARANCE_KEY) || "{}",
    ).accentColor || "indigo";
  } catch {
    return "indigo";
  }
};

export const storeAccentColor = (accentColor) => {
  try {
    const settings = JSON.parse(
      localStorage.getItem(TEACHER_APPEARANCE_KEY) || "{}",
    );
    localStorage.setItem(
      TEACHER_APPEARANCE_KEY,
      JSON.stringify({ ...settings, accentColor }),
    );
  } catch {
    localStorage.setItem(
      TEACHER_APPEARANCE_KEY,
      JSON.stringify({ accentColor }),
    );
  }
};

export const storeLiquidGlass = (enabled) => {
  try {
    const settings = JSON.parse(
      localStorage.getItem(TEACHER_APPEARANCE_KEY) || "{}",
    );
    localStorage.setItem(
      TEACHER_APPEARANCE_KEY,
      JSON.stringify({ ...settings, liquidGlass: enabled }),
    );
  } catch {
    localStorage.setItem(
      TEACHER_APPEARANCE_KEY,
      JSON.stringify({ liquidGlass: enabled }),
    );
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
      localStorage.getItem(TEACHER_APPEARANCE_KEY) || "{}",
    );
    localStorage.setItem(
      TEACHER_APPEARANCE_KEY,
      JSON.stringify({ ...settings, theme }),
    );
  } catch {
    localStorage.setItem(TEACHER_APPEARANCE_KEY, JSON.stringify({ theme }));
  }
};

export const extractYouTubeId = (url) => {
  const value = String(url || "").trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    let candidate = "";

    if (host === "youtu.be") candidate = parsed.pathname.split("/")[1] || "";
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      candidate =
        parsed.searchParams.get("v") ||
        parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ||
        "";
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) return candidate;
  } catch {
    // Fall through to support URLs pasted without a protocol.
  }

  const patterns = [
    /(?:youtube\.com\/watch\?(?:[^#\s]*&)?v=|youtu\.be\/|youtube\.com\/(?:embed|live)\/)([a-zA-Z0-9_-]{11})(?:[&\n?#/]|$)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:[&\n?#/]|$)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const normalizeYouTubeUrl = (url) => {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : String(url || "").trim();
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
