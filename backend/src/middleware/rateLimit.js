const defaultKeyGenerator = (req) => req.ip || req.connection?.remoteAddress || "unknown";

export const createRateLimiter = ({
  windowMs = 60_000,
  max = 100,
  message = "Too many requests, please try again later.",
  statusCode = 429,
  keyGenerator = defaultKeyGenerator,
} = {}) => {
  const hits = new Map();
  let lastCleanup = Date.now();

  const cleanup = (now) => {
    if (now - lastCleanup < windowMs) return;
    lastCleanup = now;
    for (const [key, entry] of hits.entries()) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  };

  return (req, res, next) => {
    const now = Date.now();
    cleanup(now);

    const key = keyGenerator(req);
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(statusCode).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    entry.count += 1;
    return next();
  };
};
