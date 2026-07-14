import { useEffect } from "react";

const SETTINGS_KEY = "learnflow_settings";

const useAppTheme = () => {
  useEffect(() => {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      const followsSystem =
        settings.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark = settings.theme === "dark" || followsSystem;

      document.documentElement.classList.toggle("dark-mode", isDark);
    } catch {
      document.documentElement.classList.remove("dark-mode");
    }
  }, []);
};

export default useAppTheme;
