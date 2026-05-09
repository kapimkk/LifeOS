import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, created, handleApiError, parseJson } from '@/lib/api';
import { registerSchema } from '@/lib/validators/auth';
import { hashPassword } from '@/server/auth/password';
import { issueSession } from '@/server/auth/session';

export async function POST(req: NextRequest) {
  try {
    const data = await parseJson(req, registerSchema);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ApiError(409, 'Já existe uma conta com este e-mail');

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        preferences: { create: { theme: 'dark' } },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await issueSession(user, {
      userAgent: req.headers.get('user-agent') ?? undefined,
      ip: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return created({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
