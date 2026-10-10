import { config } from '../config/env.js';

// In-memory bounded sliding window rate limiter
const requestCounts = new Map();

export function rateLimiter(customWindowMs, customMax) {
  const windowMs = customWindowMs || config.rateLimit.windowMs;
  const max = customMax || config.rateLimit.max;

  return (req, res, next) => {
    // Key by IP address
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(ip, record);

    // Periodic cleanup of stale entries if map gets too large
    if (requestCounts.size > 10000) {
      for (const [key, val] of requestCounts.entries()) {
        if (now > val.resetTime) requestCounts.delete(key);
      }
    }

    if (record.count > max) {
      return res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down and try again later.'
      });
    }

    next();
  };
}
