import 'server-only';
import { randomUUID, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type AccessTokenPayload,
} from './jwt';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  getAccessTokenCookie,
  getRefreshTokenCookie,
  setAuthCookies,
} from './cookies';
import { UnauthorizedError } from '@/shared/errors';

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, UnauthorizedError };

const REFRESH_TOKEN_TTL_DAYS = 7;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}

export async function issueSession(
  user: { id: string; email: string; role: 'USER' | 'ADMIN' },
  meta?: { userAgent?: string; ip?: string },
): Promise<IssuedTokens> {
  const jti = randomUUID();

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await signRefreshToken({ sub: user.id, jti });

  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      userAgent: meta?.userAgent,
      ip: meta?.ip,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  await setAuthCookies(accessToken, refreshToken);

  return { accessToken, refreshToken, refreshTokenId: jti };
}

export async function destroySession() {
  const refresh = await getRefreshTokenCookie();
  if (refresh) {
    try {
      const payload = await verifyRefreshToken(refresh);
      await prisma.refreshToken.update({
        where: { id: String(payload.jti) },
        data: { revokedAt: new Date() },
      });
    } catch {
      // ignora token inválido
    }
  }
  await clearAuthCookies();
}

export async function refreshSession() {
  const current = await getRefreshTokenCookie();
  if (!current) return null;

  let payload: Awaited<ReturnType<typeof verifyRefreshToken>>;
  try {
    payload = await verifyRefreshToken(current);
  } catch {
    await clearAuthCookies();
    return null;
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { id: String(payload.jti) },
    include: { user: true },
  });

  if (
    !stored ||
    stored.revokedAt ||
    stored.expiresAt < new Date() ||
    stored.tokenHash !== hashToken(current)
  ) {
    await clearAuthCookies();
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueSession({
    id: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
  });
}

export async function getCurrentUser() {
  const access = await getAccessTokenCookie();

  let payload: AccessTokenPayload | null = null;

  if (access) {
    try {
      payload = await verifyAccessToken(access);
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    const refreshed = await refreshSession();
    if (!refreshed) return null;
    payload = await verifyAccessToken(refreshed.accessToken);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      currency: true,
      locale: true,
      timezone: true,
      onboardedAt: true,
      preferences: true,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
