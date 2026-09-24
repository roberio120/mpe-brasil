import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Memory Sliding Window Rate Limiter
 * @param req NextRequest
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 minute)
 * @returns { allowed: boolean, remaining: number, resetTimeMs: number }
 */
export function checkRateLimit(req: NextRequest, limit: number = 10, windowMs: number = 60000) {
  // Extract client IP address
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const routeKey = `${req.nextUrl.pathname}:${ip}`;
  const now = Date.now();

  // Clean up expired keys periodically
  if (!store[routeKey] || now > store[routeKey].resetTime) {
    store[routeKey] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return { allowed: true, remaining: limit - 1, resetTimeMs: store[routeKey].resetTime };
  }

  store[routeKey].count += 1;

  if (store[routeKey].count > limit) {
    return { allowed: false, remaining: 0, resetTimeMs: store[routeKey].resetTime };
  }

  return {
    allowed: true,
    remaining: limit - store[routeKey].count,
    resetTimeMs: store[routeKey].resetTime,
  };
}
