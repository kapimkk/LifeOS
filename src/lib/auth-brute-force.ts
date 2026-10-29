/**
 * Limitador de falhas de autenticação (anti brute force).
 * 5 falhas em 1 minuto → bloqueio de 15 minutos (HTTP 429).
 *
 * Em produção multi-instância, substituir por Redis/Upstash.
 */

const FAILURE_WINDOW_MS = 60_000;
const MAX_FAILURES = 5;
const BLOCK_MS = 15 * 60_000;

interface Entry {
  failures: number[];
  blockedUntil: number;
}

const store = new Map<string, Entry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.blockedUntil <= now && entry.failures.every((t) => t <= now - FAILURE_WINDOW_MS)) {
      store.delete(key);
    }
  }
}, 60_000);

export interface BruteForceCheck {
  allowed: boolean;
  retryAfterSec?: number;
}

export function authBruteForceKey(scope: 'login' | 'register' | 'reset', ip: string): string {
  return `${scope}:${ip}`;
}

export function checkAuthBruteForce(key: string): BruteForceCheck {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) return { allowed: true };
  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }
  entry.failures = entry.failures.filter((t) => t > now - FAILURE_WINDOW_MS);
  return { allowed: true };
}

export function recordAuthFailure(key: string): BruteForceCheck {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry) {
    entry = { failures: [], blockedUntil: 0 };
    store.set(key, entry);
  }

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  entry.failures = entry.failures.filter((t) => t > now - FAILURE_WINDOW_MS);
  entry.failures.push(now);

  if (entry.failures.length >= MAX_FAILURES) {
    entry.blockedUntil = now + BLOCK_MS;
    entry.failures = [];
    return {
      allowed: false,
      retryAfterSec: Math.ceil(BLOCK_MS / 1000),
    };
  }

  return { allowed: true };
}

const requestHits = new Map<string, number[]>();

/** Conta requisições (não só falhas). Usado em recuperação de senha. */
export function consumeRateLimit(key: string, max: number, windowMs: number): BruteForceCheck {
  const now = Date.now();
  const hits = (requestHits.get(key) ?? []).filter((time) => time > now - windowMs);
  if (hits.length >= max) {
    const retryAfterSec = Math.ceil((hits[0]! + windowMs - now) / 1000);
    return { allowed: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }
  hits.push(now);
  requestHits.set(key, hits);
  return { allowed: true };
}

export function clearAuthFailures(key: string): void {
  store.delete(key);
}

export function bruteForceResponse(retryAfterSec: number) {
  return new Response(
    JSON.stringify({
      error: 'Muitas tentativas. Tente novamente mais tarde.',
      code: 'TooManyRequests',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec),
      },
    },
  );
}
