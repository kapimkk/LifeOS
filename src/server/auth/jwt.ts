import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { env } from '@/config/env';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export interface AccessTokenPayload extends JWTPayload {
  sub: string; // userId
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  jti: string; // identifies the refresh token in DB
}

export async function signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('lifeos')
    .setAudience('lifeos-app')
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(accessSecret);
}

export async function signRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('lifeos')
    .setAudience('lifeos-refresh')
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, accessSecret, {
    issuer: 'lifeos',
    audience: 'lifeos-app',
  });
  return payload as AccessTokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, refreshSecret, {
    issuer: 'lifeos',
    audience: 'lifeos-refresh',
  });
  return payload as RefreshTokenPayload;
}
