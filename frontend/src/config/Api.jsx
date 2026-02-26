import axios from "axios";
import { cacheService } from "../utils/cacheService.js";
import { invalidateRelatedCache } from "../utils/cacheInvalidation.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4500",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor - add auth token and check cache for GET requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Check cache for GET requests
  if (config.method === "get") {
    const cacheKey = cacheService.generateKey("api", config.url, config.params);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      // Return cached data by rejecting with a special error that we catch
      config.adapter = () =>
        Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: "OK (from cache)",
          headers: {},
          config,
        });

      console.log(`📦 Using cached response for: ${config.url}`);
    }
  }

  return config;
});

// ✅ Response interceptor - cache successful GET responses and handle auth
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === "get" && response.status === 200) {
      const cacheKey = cacheService.generateKey(
        "api",
        response.config.url,
        response.config.params,
      );

      // Determine TTL based on endpoint - some data should be cached longer
      let ttl = 300; // Default 5 minutes
      const url = response.config.url.toLowerCase();

      if (url.includes("/dashboard")) ttl = 300; // 5 minutes
      if (url.includes("/stats") || url.includes("/analytics")) ttl = 600; // 10 minutes
      if (url.includes("/performance") || url.includes("/trends")) ttl = 600;
      if (url.includes("/leaderboard")) ttl = 900; // 15 minutes

      cacheService.set(cacheKey, response.data, ttl);
    }

    // Invalidate related cache on mutations (POST, PUT, DELETE)
    if (["post", "put", "delete"].includes(response.config.method)) {
      invalidateRelatedCache(
        response.config.method,
        response.config.url,
        response.config.data,
      );
    }

    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      // Clear any stored auth tokens and user info
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Clear API cache on logout
      cacheService.clearByPrefix("api:");

      // Optional message flag for UI to show friendly session-expired info
      localStorage.setItem(
        "sessionExpiredMessage",
        error.response?.data?.message ||
          "Your session has expired. Please log in again.",
      );

      // Redirect to login page if running in browser
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
