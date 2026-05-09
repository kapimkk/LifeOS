import 'server-only';
import { prisma } from '@/lib/prisma';
import type { CategoryInput } from '@/lib/validators/transaction';
import { ApiError } from '@/lib/api';

export const categoriesService = {
  list(userId: string) {
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
