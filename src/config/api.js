export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-project-practicum-elearning.onrender.com/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
