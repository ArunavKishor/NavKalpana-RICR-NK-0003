/**
 * Frontend Cache Service
 * Provides client-side caching with localStorage and in-memory cache
 */

const CACHE_PREFIX = "hac_cache_";
const CACHE_EXPIRY_PREFIX = "hac_expiry_";

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 300; // 5 minutes in seconds
  }

  /**
   * Generate a cache key
   * @param {string} prefix - Cache key prefix
   * @param {string} url - URL or endpoint
   * @param {object} params - Query parameters
   * @returns {string} Cache key
   */
  generateKey(prefix, url, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join("|");

    const keyHash = btoa(`${url}${paramString}`).replace(/[^a-zA-Z0-9]/g, "");
    return `${prefix}:${keyHash}`;
  }

  /**
   * Get data from cache (checks memory first, then localStorage)
   * @param {string} key - Cache key
   * @returns {any} Cached data or null
   */
  get(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const { data, expiry } = this.memoryCache.get(key);
      if (expiry > Date.now()) {
        console.log(`✅ Memory Cache HIT: ${key}`);
        return data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check localStorage
    try {
      const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`;
      const expiry = localStorage.getItem(expiryKey);

      if (expiry && parseInt(expiry) > Date.now()) {
        const cacheKey = `${CACHE_PREFIX}${key}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          console.log(`✅ Storage Cache HIT: ${key}`);
          return JSON.parse(cached);
        }
      } else if (expiry) {
        // Clean up expired cache
        this.remove(key);
      }
    } catch (error) {
      console.error("Cache get error:", error);
    }

    return null;
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 300)
   * @returns {void}
   */
  set(key, data, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl * 1000;

    // Store in memory cache
    this.memoryCache.set(key, { data, expiry });

    // Store in localStorage
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const expiryKey = `${CACHE_EXPIRY_PREFIX}${key}`;

      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(expiryKey, expiry.toString());

      console.log(`💾 Cached: ${key}`);
    } catch (error) {
      console.error("Cache set error:", error);
      // Fallback to memory cache only if localStorage is full
    }
  }

  /**
   * Remove specific cache entry
   * @param {string} key - Cache key
   * @returns {void}
   */
  remove(key) {
    try {
      this.memoryCache.delete(key);
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      localStorage.removeItem(`${CACHE_EXPIRY_PREFIX}${key}`);
      console.log(`🗑️ Removed cache: ${key}`);
    } catch (error) {
      console.error("Cache remove error:", error);
    }
  }

  /**
   * Clear all cache entries by prefix
   * @param {string} prefix - Prefix to match
   * @returns {void}
   */
  clearByPrefix(prefix) {
    try {
      // Clear memory cache
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key);
        }
      }

      // Clear localStorage
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes(prefix)) {
          localStorage.removeItem(key);
        }
      });

      console.log(`🗑️ Cleared cache with prefix: ${prefix}`);
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  /**
   * Clear all cache
   * @returns {void}
   */
  clearAll() {
    try {
      this.memoryCache.clear();
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (
          key.startsWith(CACHE_PREFIX) ||
          key.startsWith(CACHE_EXPIRY_PREFIX)
        ) {
          localStorage.removeItem(key);
        }
      });
      console.log("🗑️ All cache cleared");
    } catch (error) {
      console.error("Cache clear all error:", error);
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    const memoryCacheSize = this.memoryCache.size;
    let storageCacheSize = 0;

    try {
      const keys = Object.keys(localStorage);
      storageCacheSize = keys.filter((key) =>
        key.startsWith(CACHE_PREFIX),
      ).length;
    } catch (error) {
      console.error("Error getting cache stats:", error);
    }

    return {
      memoryCache: memoryCacheSize,
      storageCache: storageCacheSize,
      total: memoryCacheSize + storageCacheSize,
    };
  }
}

export const cacheService = new CacheService();
export default cacheService;
