const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-project-practicum-elearning.onrender.com/api";

const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

export const API_ORIGIN = normalizedApiBaseUrl.replace(/\/api$/i, "");
export const API_BASE_URL = /\/api$/i.test(normalizedApiBaseUrl)
  ? normalizedApiBaseUrl
  : `${normalizedApiBaseUrl}/api`;
