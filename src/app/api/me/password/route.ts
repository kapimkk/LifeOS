import type { NextRequest } from 'next/server';
import { ApiError, handleApiError, ok, parseJson } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { changePasswordSchema } from '@/lib/validators/user';
import { comparePassword, hashPassword } from '@/server/auth/password';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, changePasswordSchema);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new ApiError(404, 'Usuário não encontrado');

    const valid = await comparePassword(body.currentPassword, dbUser.passwordHash);
    if (!valid) throw new ApiError(400, 'Senha atual incorreta');

    const passwordHash = await hashPassword(body.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
