import { useEffect } from "react";

const SETTINGS_KEY = "learnflow_settings";

const useAppTheme = () => {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      let theme = "system";
      try {
        const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
        theme = settings.theme || "system";
      } catch {
        theme = "system";
      }

      const isDark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark-mode", isDark);
    };

    syncTheme();
    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, []);
};

export default useAppTheme;
