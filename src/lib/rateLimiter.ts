/**
 * Rate Limiter Service
 * 
 * Implements client-side rate limiting to prevent API abuse
 * and handle Spoonacular API rate limits gracefully
 */

interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private config: Required<RateLimiterConfig>;

  constructor(config: RateLimiterConfig) {
    this.config = {
      keyPrefix: 'default',
      ...config,
    };
  }

  /**
   * Check if a request can be made for the given key
   */
  canMakeRequest(key: string = 'default'): boolean {
    const fullKey = `${this.config.keyPrefix}:${key}`;
    const now = Date.now();
    const requestData = this.requests.get(fullKey);

    // If no previous requests or reset time has passed
    if (!requestData || now > requestData.resetTime) {
      this.requests.set(fullKey, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // Check if we've exceeded the limit
    if (requestData.count >= this.config.maxRequests) {
      return false;
    }

    // Increment counter
    requestData.count++;
    return true;
  }

  /**
   * Get remaining requests for the given key
   */
  getRemainingRequests(key: string = 'default'): number {
    const fullKey = `${this.config.keyPrefix}:${key}`;
    const now = Date.now();
    const requestData = this.requests.get(fullKey);

    if (!requestData || now > requestData.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - requestData.count);
  }

  /**
   * Get time until reset for the given key
   */
  getTimeUntilReset(key: string = 'default'): number {
    const fullKey = `${this.config.keyPrefix}:${key}`;
    const now = Date.now();
    const requestData = this.requests.get(fullKey);

    if (!requestData || now > requestData.resetTime) {
      return 0;
    }

    return Math.max(0, requestData.resetTime - now);
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear();
  }
}

// Pre-configured rate limiters for different services with environment-based configuration
export const spoonacularRateLimiter = new RateLimiter({
  maxRequests: parseInt(process.env.SPOONACULAR_RATE_LIMIT_REQUESTS || '10'),
  windowMs: parseInt(process.env.SPOONACULAR_RATE_LIMIT_WINDOW || '60000'),
  keyPrefix: 'spoonacular',
});

export const imageRateLimiter = new RateLimiter({
  maxRequests: parseInt(process.env.IMAGE_RATE_LIMIT_REQUESTS || '50'),
  windowMs: parseInt(process.env.IMAGE_RATE_LIMIT_WINDOW || '60000'),
  keyPrefix: 'images',
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: parseInt(process.env.API_RATE_LIMIT_REQUESTS || '100'),
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),
  keyPrefix: 'api',
});

export default RateLimiter;