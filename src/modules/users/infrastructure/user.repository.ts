import 'server-only';
import { type TransactionType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  currency: true,
  locale: true,
  timezone: true,
  onboardedAt: true,
} as const;

export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  },

  async findByIdWithHash(id: string) {
    return prisma.user.findUnique({ where: { id }, select: { ...userSelect, passwordHash: true } });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    defaultCategories?: Array<{ name: string; color: string; icon: string; type: TransactionType }>;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        ...(data.defaultCategories && {
          categories: {
            create: data.defaultCategories.map((c) => ({
              name: c.name,
              color: c.color,
              icon: c.icon,
              type: c.type,
            })),
          },
        }),
      },
      select: { id: true, name: true, email: true, role: true },
    });
  },

  async updatePasswordHash(id: string, passwordHash: string) {
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async updateOnboarding(id: string) {
    await prisma.user.update({ where: { id }, data: { onboardedAt: new Date() } });
  },
};
