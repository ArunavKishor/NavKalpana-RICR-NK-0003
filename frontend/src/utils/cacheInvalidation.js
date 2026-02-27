/**
 * Cache Invalidation Utility
 * Automatically clear related caches when data is modified
 */

import { cacheService } from "./cacheService.js";

/**
 * Invalidate cache on POST/PUT/DELETE operations
 * @param {string} method - HTTP method (POST, PUT, DELETE)
 * @param {string} url - Request URL
 * @param {object} data - Request data
 */
export const invalidateRelatedCache = (method, url, data = {}) => {
  if (!["POST", "PUT", "DELETE"].includes(method.toUpperCase())) {
    return;
  }

  const urlLower = url.toLowerCase();

  // Invalidate cache patterns based on the endpoint
  const invalidationMap = {
    "/api/students": ["students:"],
    "/api/batches": ["batches:"],
    "/api/attendance": ["attendance:"],
    "/api/assessments": ["assessments:"],
    "/api/dashboard": ["dashboard:"],
    "/api/teachers": ["teachers:"],
    "/api/support": ["support:"],
  };

  // Find matching invalidation patterns
  for (const [endpoint, prefixes] of Object.entries(invalidationMap)) {
    if (urlLower.includes(endpoint)) {
      // Invalidate all matching cache entries
      prefixes.forEach((prefix) => {
        cacheService.clearByPrefix(`api:${prefix}`);
      });

      // Also invalidate dashboard caches as they depend on other data
      if (!endpoint.includes("dashboard")) {
        cacheService.clearByPrefix("api:dashboard:");
      }

      console.log(
        `🔄 Invalidated cache for ${method.toUpperCase()} ${endpoint}`,
      );
      break;
    }
  }
};

/**
 * Clear all cache - useful for logout or refresh operations
 */
export const clearAllCache = () => {
  cacheService.clearAll();
  console.log("🗑️ All cache cleared");
};

/**
 * Clear specific cache type
 * @param {string} type - Cache type (e.g., 'students', 'batches', 'dashboard')
 */
export const clearCacheByType = (type) => {
  cacheService.clearByPrefix(`api:${type}:`);
  console.log(`🗑️ Cleared cache for: ${type}`);
};

export default {
  invalidateRelatedCache,
  clearAllCache,
  clearCacheByType,
};
