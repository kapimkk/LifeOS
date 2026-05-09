import type { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { ApiError, handleApiError, ok, parseJson } from '@/lib/api';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { hashPassword } from '@/server/auth/password';

export async function POST(req: NextRequest) {
  try {
    const data = await parseJson(req, resetPasswordSchema);

    const tokenHash = createHash('sha256').update(data.token).digest('hex');

    const reset = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      throw new ApiError(400, 'Token inválido ou expirado');
    }

    const passwordHash = await hashPassword(data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      // revoga todas as sessões existentes
      prisma.refreshToken.updateMany({
        where: { userId: reset.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return ok({ reset: true });
  } catch (err) {
    return handleApiError(err);
  }
}
