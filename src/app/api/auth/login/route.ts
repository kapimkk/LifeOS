import type { NextRequest } from 'next/server';
import { ApiError, handleApiError, ok, parseJson } from '@/lib/api';
import { loginSchema } from '@/modules/users/interfaces/schemas';
import { getUserByEmailQuery } from '@/modules/users/application/queries/get-user.query';
import { comparePassword } from '@/shared/auth/password';
import { issueSession } from '@/shared/auth/session';
import { rateLimit } from '@/lib/rate-limit';

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : 'unknown';
  return `login:${ip}`;
}

export async function POST(req: NextRequest) {
  try {
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
    const user = await getUserByEmailQuery(data.email);

    const dummyHash = '$2b$12$invalidhashpadding000000000000000000000000000000000000000';
    const valid = user
      ? await comparePassword(data.password, user.passwordHash)
      : await comparePassword(data.password, dummyHash).then(() => false);

    if (!user || !valid) throw new ApiError(401, 'Credenciais inválidas');

    await issueSession(
      { id: user.id, email: user.email, role: user.role },
      {
        userAgent: req.headers.get('user-agent') ?? undefined,
        ip: req.headers.get('x-forwarded-for') ?? undefined,
      },
    );

    return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return handleApiError(err);
  }
}
