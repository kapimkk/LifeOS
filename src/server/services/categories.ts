import 'server-only';
import { prisma } from '@/lib/prisma';
import type { CategoryInput } from '@/lib/validators/transaction';
import { ApiError } from '@/lib/api';

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

export const categoriesService = {
  /**
   * Lists all categories for the user.
   * If the user has none yet (account created before default-seeding was added),
   * creates the default set first so the UI is never empty.
   */
  async list(userId: string) {
    const existing = await prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    if (existing.length > 0) return existing;

    // Lazy-seed defaults for accounts that pre-date the automatic provisioning.
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
      skipDuplicates: true,
    });

    return prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  },

  async create(userId: string, data: CategoryInput) {
    const exists = await prisma.category.findFirst({
      where: { userId, name: data.name, type: data.type },
    });
    if (exists) throw new ApiError(409, 'Já existe uma categoria com este nome');
    return prisma.category.create({
      data: { ...data, userId },
    });
  },

  async update(userId: string, id: string, data: Partial<CategoryInput>) {
    await this.assertOwnership(userId, id);
    return prisma.category.update({ where: { id }, data });
  },

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    await prisma.category.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string) {
    const found = await prisma.category.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Categoria não encontrada');
  },
};
