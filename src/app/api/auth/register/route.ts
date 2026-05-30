import type { NextRequest } from 'next/server';
import { ApiError, created, handleApiError, parseJson } from '@/lib/api';
import { registerSchema } from '@/modules/users/interfaces/schemas';
import { registerUserCommand } from '@/modules/users/application/commands/register-user.command';
import { getClientIp } from '@/lib/get-client-ip';
import {
  authBruteForceKey,
  bruteForceResponse,
  checkAuthBruteForce,
  recordAuthFailure,
} from '@/lib/auth-brute-force';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const bfKey = authBruteForceKey('register', ip);

  try {
    const blocked = checkAuthBruteForce(bfKey);
    if (!blocked.allowed) {
      return bruteForceResponse(blocked.retryAfterSec ?? 900);
    }

    const data = await parseJson(req, registerSchema);
    const user = await registerUserCommand(data);
    if (!user) throw new ApiError(500, 'Erro ao criar usuário');

    return created({
      user: { ...user, isApproved: false },
      message: 'Conta criada com sucesso. Aguarde a liberação do administrador para fazer login.',
      awaitingApproval: true,
    });
  } catch (err) {
    const afterFail = recordAuthFailure(bfKey);
    if (!afterFail.allowed) {
      return bruteForceResponse(afterFail.retryAfterSec ?? 900);
    }
    return handleApiError(err);
  }
}
