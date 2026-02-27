import { getFromCache, setCache, generateCacheKey } from "../utils/cache.js";

/**
 * Middleware to cache GET requests
 * @param {string} prefix - Cache key prefix
 * @param {number} ttl - Time to live in seconds (default: 600)
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (prefix, ttl = 600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      // Generate cache key including query parameters
      const cacheKey = generateCacheKey(prefix, {
        ...req.query,
        userId: req.user?.id, // Include user ID if authenticated
      });

      // Try to get from cache
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache HIT: ${cacheKey}`);
        return res.status(200).json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache successful responses
      res.json = function (data) {
        if (res.statusCode === 200) {
          setCache(cacheKey, data, ttl)
            .then(() => console.log(`✅ Cached: ${cacheKey}`))
            .catch((err) => console.error("Caching error:", err));
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

/**
 * Middleware to add HTTP cache headers
 * @param {boolean} isPublic - Whether response is public or private
 * @param {number} maxAge - Max age in seconds
 * @returns {Function} Express middleware
 */
export const setHttpCacheHeaders = (isPublic = false, maxAge = 600) => {
  return (req, res, next) => {
    if (req.method === "GET") {
      const cacheControl = isPublic
        ? `public, max-age=${maxAge}`
        : `private, max-age=${maxAge}`;

      res.set({
        "Cache-Control": cacheControl,
        "X-Cache-Control": "enabled",
      });
    }
    next();
  };
};

export default cacheMiddleware;
