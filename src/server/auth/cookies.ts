import { cookies } from 'next/headers';
import { env } from '@/config/env';

export const ACCESS_TOKEN_COOKIE = 'lifeos_access';
export const REFRESH_TOKEN_COOKIE = 'lifeos_refresh';

const baseOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax' as const,
  path: '/',
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: 60 * 15, // 15 min
  });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessTokenCookie() {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshTokenCookie() {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value;
}
