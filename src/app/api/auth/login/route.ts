import type { NextRequest } from 'next/server';
import { ApiError, handleApiError, ok, parseJson } from '@/lib/api';
import { loginSchema } from '@/modules/users/interfaces/schemas';
import { getUserByEmailQuery } from '@/modules/users/application/queries/get-user.query';
import { comparePassword } from '@/shared/auth/password';
import { issueSession } from '@/shared/auth/session';
import { assertSignInAllowed } from '@/shared/auth/sign-in-policy';
import { getClientIp } from '@/lib/get-client-ip';
import {
  authBruteForceKey,
  bruteForceResponse,
  checkAuthBruteForce,
  clearAuthFailures,
  recordAuthFailure,
} from '@/lib/auth-brute-force';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const bfKey = authBruteForceKey('login', ip);

  try {
    const blocked = checkAuthBruteForce(bfKey);
    if (!blocked.allowed) {
      return bruteForceResponse(blocked.retryAfterSec ?? 900);
    }

    const data = await parseJson(req, loginSchema);
    const user = await getUserByEmailQuery(data.email);

    const dummyHash = '$2b$12$invalidhashpadding000000000000000000000000000000000000000';
    const valid = user
      ? await comparePassword(data.password, user.passwordHash)
      : await comparePassword(data.password, dummyHash).then(() => false);

    if (!user || !valid) {
      const afterFail = recordAuthFailure(bfKey);
      if (!afterFail.allowed) {
        return bruteForceResponse(afterFail.retryAfterSec ?? 900);
      }
      throw new ApiError(401, 'Credenciais inválidas');
    }

    assertSignInAllowed(user);
    clearAuthFailures(bfKey);

    await issueSession(
      { id: user.id, email: user.email, role: user.role },
      {
        userAgent: req.headers.get('user-agent') ?? undefined,
        ip,
      },
    );

    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
