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
  preferences: true,
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
        preferences: { create: { theme: 'dark' } },
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

  async updateProfile(
    id: string,
    data: Partial<{
      name: string;
      avatarUrl: string | null;
      currency: string;
      locale: string;
      timezone: string;
    }>,
  ) {
    return prisma.user.update({ where: { id }, data, select: userSelect });
  },

  async updatePasswordHash(id: string, passwordHash: string) {
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async updateOnboarding(id: string) {
    await prisma.user.update({ where: { id }, data: { onboardedAt: new Date() } });
  },

  async upsertPreferences(
    userId: string,
    data: Partial<{
      theme: string;
      weeklyDigest: boolean;
      emailReminders: boolean;
      pushReminders: boolean;
    }>,
  ) {
    return prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  },
};
