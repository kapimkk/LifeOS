/**
 * In-memory sliding-window rate limiter.
 *
 * Adequate for a single-instance Node.js server (MVP / development).
 * For multi-instance production deployments, replace the `store` with
 * a Redis-backed implementation (e.g. `@upstash/ratelimit`).
 */

interface Window {
  count: number;
  resetAt: number;
}

// Map<key, Window> — lives in module scope (persists across requests in the same process).
const store = new Map<string, Window>();

// Periodically sweep expired entries so the map doesn't grow unboundedly.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, win] of store) {
      if (win.resetAt <= now) store.delete(key);
    }
  },
  60_000, // sweep every 60 s
);

export interface RateLimitOptions {
  /** Sliding window size in milliseconds. Default: 60_000 (1 min) */
  windowMs?: number;
  /** Max requests allowed within the window. Default: 10 */
  max?: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether `key` is within its rate limit.
 * Returns `{ success: false }` when the limit is exceeded.
 */
export function rateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 10;
  const now = Date.now();

  let win = store.get(key);

  if (!win || win.resetAt <= now) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(key, win);
  }

  win.count += 1;

  return {
    success: win.count <= max,
    remaining: Math.max(0, max - win.count),
    resetAt: win.resetAt,
  };
}
