import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { SerializedInvestment } from '../domain/entities';
import type { InvestmentInput } from '@/lib/validators/investment';

function serialize(inv: {
  id: string;
  name: string;
  amount: Prisma.Decimal;
  type: string;
  color: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SerializedInvestment {
  return {
    id: inv.id,
    name: inv.name,
    amount: Number(inv.amount),
    type: inv.type,
    color: inv.color,
    notes: inv.notes,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  };
}

export const investmentRepository = {
  async findByUserId(userId: string): Promise<SerializedInvestment[]> {
    const items = await prisma.investment.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
    });
    return items.map(serialize);
  },

  async create(userId: string, data: InvestmentInput): Promise<SerializedInvestment> {
    const created = await prisma.investment.create({
      data: {
        userId,
        name: data.name,
        amount: new Prisma.Decimal(data.amount),
        type: data.type,
        color: data.color,
        notes: data.notes ?? null,
      },
    });
    return serialize(created);
  },

  async update(
    userId: string,
    id: string,
    data: Partial<InvestmentInput>,
  ): Promise<SerializedInvestment> {
    await this.assertOwnership(userId, id);
    const updated = await prisma.investment.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
      },
    });
    return serialize(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.investment.delete({ where: { id } });
  },

  async stats(userId: string) {
    const items = await prisma.investment.findMany({
      where: { userId },
      select: { amount: true, type: true },
    });
    const total = items.reduce((acc, i) => acc + Number(i.amount), 0);
    const byType = items.reduce<Record<string, number>>((acc, i) => {
      acc[i.type] = (acc[i.type] ?? 0) + Number(i.amount);
      return acc;
    }, {});
    return { total, count: items.length, byType };
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
    const found = await prisma.investment.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Investimento não encontrado');
  },
};
