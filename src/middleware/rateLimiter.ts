// src/middleware/rateLimiter.ts
const RATE_LIMIT = 150; // max requests per day (Spoonacular free tier)
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 Stunden

const requestCounts: Record<string, { count: number; reset: number }> = {};

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (!requestCounts[ip] || requestCounts[ip].reset < now) {
    requestCounts[ip] = { count: 1, reset: now + WINDOW_MS };
    return true;
  }
  if (requestCounts[ip].count < RATE_LIMIT) {
    requestCounts[ip].count++;
    return true;
  }
  return false;
}

export function getRateLimitInfo(ip: string) {
  const entry = requestCounts[ip];
  if (!entry) return { remaining: RATE_LIMIT, reset: Date.now() + WINDOW_MS };
  return { remaining: Math.max(0, RATE_LIMIT - entry.count), reset: entry.reset };
}
