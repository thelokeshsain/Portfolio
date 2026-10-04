/**
 * In-Memory Sliding Window Rate Limiter
 * Provides IP-based rate limiting for sensitive endpoints (contact, auth, 2FA)
 */

class SlidingWindowRateLimiter {
  constructor() {
    this.hits = new Map();
    // Periodically clean up expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000).unref?.();
    }
  }

  check(key, limit, windowMs) {
    const now = Date.now();
    const timestamps = this.hits.get(key) || [];

    // Filter out timestamps outside window
    const valid = timestamps.filter(ts => now - ts < windowMs);

    if (valid.length >= limit) {
      const oldest = valid[0];
      const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
      return {
        success: false,
        limit,
        remaining: 0,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    valid.push(now);
    this.hits.set(key, valid);

    return {
      success: true,
      limit,
      remaining: limit - valid.length,
      retryAfter: 0,
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter(ts => now - ts < 3600000); // 1 hour max age
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }
}

const rateLimiter = new SlidingWindowRateLimiter();
export default rateLimiter;
