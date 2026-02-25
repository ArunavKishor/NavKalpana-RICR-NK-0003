import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4500",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("AdminToken") ||
    localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor for auth/session handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear any stored auth tokens and user info
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("AdminToken");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("AdminUser");
      localStorage.removeItem("token");

      // Optional message flag for UI to show friendly session-expired info
      sessionStorage.setItem(
        "sessionExpiredMessage",
        error.response.data?.message || "Your session has expired. Please log in again."
      );

      // Redirect to login page if running in browser
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
