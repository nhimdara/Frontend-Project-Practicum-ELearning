import { useEffect } from "react";

export const SETTINGS_KEY = "learnflow_settings";

export const ACCENT_PRESETS = {
  indigo: {
    id: "indigo",
    label: "Liquid Indigo",
    color: "#6366f1",
    secondary: "#8b5cf6",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    glow: "rgba(99, 102, 241, 0.35)",
    light: "rgba(99, 102, 241, 0.12)",
    border: "rgba(99, 102, 241, 0.3)",
    ring: "rgba(99, 102, 241, 0.25)"
  },
  cyan: {
    id: "cyan",
    label: "Cyber Cyan",
    color: "#06b6d4",
    secondary: "#3b82f6",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    glow: "rgba(6, 182, 212, 0.35)",
    light: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.3)",
    ring: "rgba(6, 182, 212, 0.25)"
  },
  emerald: {
    id: "emerald",
    label: "Emerald Wave",
    color: "#10b981",
    secondary: "#059669",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    glow: "rgba(16, 185, 129, 0.35)",
    light: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.3)",
    ring: "rgba(16, 185, 129, 0.25)"
  },
  ruby: {
    id: "ruby",
    label: "Sunset Ruby",
    color: "#f43f5e",
    secondary: "#e11d48",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    glow: "rgba(244, 63, 94, 0.35)",
    light: "rgba(244, 63, 94, 0.12)",
    border: "rgba(244, 63, 94, 0.3)",
    ring: "rgba(244, 63, 94, 0.25)"
  },
  violet: {
    id: "violet",
    label: "Violet Quartz",
    color: "#8b5cf6",
    secondary: "#d946ef",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
    glow: "rgba(139, 92, 246, 0.35)",
    light: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.3)",
    ring: "rgba(139, 92, 246, 0.25)"
  },
  amber: {
    id: "amber",
    label: "Amber Gold",
    color: "#f59e0b",
    secondary: "#d97706",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    glow: "rgba(245, 158, 11, 0.35)",
    light: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.3)",
    ring: "rgba(245, 158, 11, 0.25)"
  }
};

export const FONT_SIZE_MAP = {
  small: { px: "13px", rootPx: "14px", label: "Small (13px)" },
  medium: { px: "15px", rootPx: "16px", label: "Medium (15px)" },
  large: { px: "17px", rootPx: "18px", label: "Large (17px)" },
  "x-large": { px: "19px", rootPx: "20px", label: "Extra Large (19px)" }
};

export const FONT_FAMILY_MAP = {
  Inter: { name: "Inter", stack: "'Inter', sans-serif", desc: "Clean & Modern" },
  "DM Sans": { name: "DM Sans", stack: "'DM Sans', sans-serif", desc: "Friendly & Grotesque" },
  Outfit: { name: "Outfit", stack: "'Outfit', sans-serif", desc: "Geometric & Tech" },
  Roboto: { name: "Roboto", stack: "'Roboto', sans-serif", desc: "Neutral & Structured" },
  Poppins: { name: "Poppins", stack: "'Poppins', sans-serif", desc: "Rounded & Expressive" },
  "Plus Jakarta Sans": { name: "Plus Jakarta Sans", stack: "'Plus Jakarta Sans', sans-serif", desc: "Premium iOS Feel" }
};

export const loadStoredSettings = () => {
  try {
    const r = localStorage.getItem(SETTINGS_KEY);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("learnflow_settings_change"));
  } catch {
    // Local storage unavailable
  }
};

export const applyAllSettings = (s = {}) => {
  const root = document.documentElement;

  // 1. Theme Mode (light / dark / system)
  const theme = s.theme || "system";
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark-mode", isDark);

  // 2. Font Size
  const sizeObj = FONT_SIZE_MAP[s.fontSize] || FONT_SIZE_MAP.medium;
  root.style.setProperty("--app-font-size", sizeObj.px);
  root.style.fontSize = sizeObj.rootPx;

  // 3. Font Family
  const fontKey = s.fontFamily || "Inter";
  const fontObj = FONT_FAMILY_MAP[fontKey] || FONT_FAMILY_MAP.Inter;
  root.style.setProperty("--app-font-family", fontObj.stack);

  // 4. Accent Color
  const accentKey = s.accentColor || "indigo";
  const accent = ACCENT_PRESETS[accentKey] || ACCENT_PRESETS.indigo;
  root.dataset.accent = accent.id;
  root.style.setProperty("--accent-color", accent.color);
  root.style.setProperty("--accent-secondary", accent.secondary);
  root.style.setProperty("--accent-gradient", accent.gradient);
  root.style.setProperty("--accent-glow", accent.glow);
  root.style.setProperty("--accent-light", accent.light);
  root.style.setProperty("--accent-border", accent.border);
  root.style.setProperty("--accent-ring", accent.ring);

  // Keep the shared LearnFlow palette in sync. Most student-facing components
  // consume these tokens rather than the appearance-panel accent tokens.
  root.style.setProperty("--lf-primary", accent.color);
  root.style.setProperty("--lf-primary-strong", accent.secondary);
  root.style.setProperty("--lf-accent", accent.secondary);

  // 5. Flags & Display modes
  const reduceAnimations = !!(s.reduceAnimations || s.reducedMotion);
  root.classList.toggle("reduce-animations", reduceAnimations);
  root.dataset.motion = reduceAnimations ? "reduced" : "full";
  root.classList.toggle("high-contrast", !!(s.highContrast || s.highContrastMode));
  root.classList.toggle("compact-view", !!s.compactView);
  root.classList.toggle("liquid-glass-disabled", s.liquidGlass === false);
  root.classList.toggle("classic-ui", s.liquidGlass === false);
  root.dataset.liquidGlass = s.liquidGlass === false ? "off" : "on";
  root.classList.toggle("glossy-disabled", s.glossyReflections === false);
};

const useAppTheme = () => {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const sync = () => {
      const settings = loadStoredSettings();
      applyAllSettings(settings);
    };

    // Apply settings immediately on mount
    sync();

    media.addEventListener("change", sync);
    window.addEventListener("learnflow_settings_change", sync);
    window.addEventListener("storage", sync);

    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("learnflow_settings_change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
};

export default useAppTheme;
