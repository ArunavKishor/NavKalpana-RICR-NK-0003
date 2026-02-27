import NodeCache from "node-cache";

// Create a cache store with default TTL of 10 minutes (600 seconds)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

/**
 * Generate a cache key from request parameters
 * @param {string} prefix - Cache key prefix (e.g., 'dashboard', 'students')
 * @param {object} params - Query/route parameters to include in key
 * @returns {string} Formatted cache key
 */
export const generateCacheKey = (prefix, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached data or undefined
 */
export const getFromCache = async (key) => {
  try {
    return cache.get(key);
  } catch (error) {
    console.error("Cache get error:", error);
    return undefined;
  }
};

/**
 * Store data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 600)
 * @returns {Promise<void>}
 */
export const setCache = async (key, data, ttl = 600) => {
  try {
    cache.set(key, data, ttl);
  } catch (error) {
    console.error("Cache set error:", error);
  }
};

/**
 * Delete specific cache key
 * @param {string} key - Cache key to delete
 * @returns {Promise<void>}
 */
export const deleteCache = async (key) => {
  try {
    cache.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
};

/**
 * Clear all cache
 * @returns {Promise<void>}
 */
export const clearCache = async () => {
  try {
    cache.flushAll();
  } catch (error) {
    console.error("Cache clear error:", error);
  }
};

/**
 * Clear cache by prefix pattern
 * @param {string} prefix - Prefix to match
 * @returns {Promise<void>}
 */
export const clearCacheByPrefix = async (prefix) => {
  try {
    const keys = cache.keys();
    const matchingKeys = keys.filter((key) => key.startsWith(prefix));
    matchingKeys.forEach((key) => cache.del(key));
  } catch (error) {
    console.error("Cache clear by prefix error:", error);
  }
};

export default cache;
