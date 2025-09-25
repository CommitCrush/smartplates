/**
 * Rate Limiter for Upload Routes
 * Prevents abuse by limiting uploads per user per time window
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class SimpleRateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60 * 1000, maxRequests: number = 5) {
    this.windowMs = windowMs; // 1 minute default
    this.maxRequests = maxRequests; // 5 requests default
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;

    // Initialize or reset if window expired
    if (!this.store[key] || now >= this.store[key].resetTime) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs
      };
    }

    const entry = this.store[key];
    const allowed = entry.count < this.maxRequests;

    if (allowed) {
      entry.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now >= this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}

// Export singleton instance
export const uploadRateLimiter = new SimpleRateLimiter(
  60 * 1000, // 1 minute window
  5 // 5 uploads per minute per user
);

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetTime: number;
};