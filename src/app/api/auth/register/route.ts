import type { NextRequest } from 'next/server';
import { ApiError, created, handleApiError, parseJson } from '@/lib/api';
import { registerSchema } from '@/modules/users/interfaces/schemas';
import { registerUserCommand } from '@/modules/users/application/commands/register-user.command';
import { issueSession } from '@/shared/auth/session';

export async function POST(req: NextRequest) {
  try {
    const data = await parseJson(req, registerSchema);
    const user = await registerUserCommand(data);
    if (!user) throw new ApiError(500, 'Erro ao criar usuário');

    await issueSession(
      { id: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN' },
      {
        userAgent: req.headers.get('user-agent') ?? undefined,
        ip: req.headers.get('x-forwarded-for') ?? undefined,
      },
    );

    return created({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
