import type { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { handleApiError, ok, parseJson } from '@/lib/api';
import { forgotPasswordSchema } from '@/lib/validators/auth';

const RESET_TTL_MIN = 30;

export async function POST(req: NextRequest) {
  try {
    const data = await parseJson(req, forgotPasswordSchema);

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Resposta padronizada para evitar enumeração de e-mails.
    if (!user) return ok({ sent: true });

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TTL_MIN * 60 * 1000),
      },
    });

    // Em produção: enviar e-mail com link contendo o token.
    // Em desenvolvimento devolvemos no console e na resposta para facilitar testes.
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[reset-password] token para ${user.email}: ${token}`);
      return ok({ sent: true, devToken: token });
    }

    return ok({ sent: true });
  } catch (err) {
    return handleApiError(err);
  }
}
