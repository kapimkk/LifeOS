import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError, ok, parseJson } from '@/lib/api';
import { loginSchema } from '@/lib/validators/auth';
import { comparePassword } from '@/server/auth/password';
import { issueSession } from '@/server/auth/session';
import { rateLimit } from '@/lib/rate-limit';

/** Derive a stable key from the request: prefer X-Forwarded-For, fall back to a generic key. */
function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : 'unknown';
  return `login:${ip}`;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 attempts per IP per minute to prevent brute-force attacks.
    const limit = rateLimit(clientKey(req), { windowMs: 60_000, max: 5 });
    if (!limit.success) {
      const retryAfterSecs = Math.ceil((limit.resetAt - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSecs),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    const data = await parseJson(req, loginSchema);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    // Deliberate constant-time comparison path: always run comparePassword even when
    // the user is not found, using a dummy hash, to prevent user-enumeration timing attacks.
    const dummyHash = '$2b$12$invalidhashpadding000000000000000000000000000000000000000';
    const valid = user ? await comparePassword(data.password, user.passwordHash) : await comparePassword(data.password, dummyHash).then(() => false);

    if (!user || !valid) throw new ApiError(401, 'Credenciais inválidas');

    await issueSession(
      { id: user.id, email: user.email, role: user.role },
      {
        userAgent: req.headers.get('user-agent') ?? undefined,
        ip: req.headers.get('x-forwarded-for') ?? undefined,
      },
    );

    return ok({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
