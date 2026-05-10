import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, created, handleApiError, parseJson } from '@/lib/api';
import { registerSchema } from '@/lib/validators/auth';
import { hashPassword } from '@/server/auth/password';
import { issueSession } from '@/server/auth/session';

/**
 * Default categories provisioned for every new user at registration.
 * Mirrors the seed data so new accounts start with a useful set.
 */
const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', color: '#f97316', icon: 'utensils', type: 'EXPENSE' },
  { name: 'Transporte', color: '#3b82f6', icon: 'car', type: 'EXPENSE' },
  { name: 'Lazer', color: '#a855f7', icon: 'gamepad-2', type: 'EXPENSE' },
  { name: 'Estudos', color: '#06b6d4', icon: 'book-open', type: 'EXPENSE' },
  { name: 'Moradia', color: '#ef4444', icon: 'home', type: 'EXPENSE' },
  { name: 'Saúde', color: '#10b981', icon: 'heart-pulse', type: 'EXPENSE' },
  { name: 'Investimentos', color: '#22c55e', icon: 'trending-up', type: 'EXPENSE' },
  { name: 'Outros', color: '#94a3b8', icon: 'tag', type: 'EXPENSE' },
  { name: 'Salário', color: '#16a34a', icon: 'wallet', type: 'INCOME' },
  { name: 'Freelance', color: '#0ea5e9', icon: 'briefcase', type: 'INCOME' },
  { name: 'Rendimentos', color: '#84cc16', icon: 'coins', type: 'INCOME' },
] as const;

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
        // Provision default categories at creation time
        categories: {
          create: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
        },
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
