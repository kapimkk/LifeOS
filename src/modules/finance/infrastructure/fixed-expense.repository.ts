import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { SerializedFixedExpense } from '../domain/fixed-expense.entities';
import type { FixedExpenseInput } from '@/lib/validators/fixed-expense';

function serialize(row: {
  id: string;
  name: string;
  amount: Prisma.Decimal;
  dueDate: number;
  createdAt: Date;
}): SerializedFixedExpense {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    dueDate: row.dueDate,
    createdAt: row.createdAt.toISOString(),
  };
}

export const fixedExpenseRepository = {
  async findByUserId(userId: string): Promise<SerializedFixedExpense[]> {
    const items = await prisma.fixedExpense.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });
    return items.map(serialize);
  },

  async totalByUserId(userId: string): Promise<number> {
    const agg = await prisma.fixedExpense.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return Number(agg._sum.amount ?? 0);
  },

  async create(userId: string, data: FixedExpenseInput): Promise<SerializedFixedExpense> {
    const created = await prisma.fixedExpense.create({
      data: {
        userId,
        name: data.name,
        amount: new Prisma.Decimal(data.amount),
        dueDate: data.dueDate,
      },
    });
    return serialize(created);
  },

  async update(
    userId: string,
    id: string,
    data: Partial<FixedExpenseInput>,
  ): Promise<SerializedFixedExpense> {
    await this.assertOwnership(userId, id);
    const updated = await prisma.fixedExpense.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
      },
    });
    return serialize(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.fixedExpense.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
    const found = await prisma.fixedExpense.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Gasto fixo não encontrado');
  },
};
