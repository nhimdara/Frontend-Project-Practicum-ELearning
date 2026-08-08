import { API_BASE_URL } from "./api";

const SESSION_KEY = "learnflow_session";

export function installAuthenticatedFetch() {
  if (window.__elearningAuthenticatedFetchInstalled) return;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (!String(url).startsWith(API_BASE_URL)) return nativeFetch(input, init);
    let token = "";
    try { token = JSON.parse(localStorage.getItem(SESSION_KEY) || "null")?.token || ""; } catch { /* ignore invalid old session */ }
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init.headers || {}).forEach((value, key) => headers.set(key, value));
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return nativeFetch(input, { ...init, headers });
  };
  window.__elearningAuthenticatedFetchInstalled = true;
}
