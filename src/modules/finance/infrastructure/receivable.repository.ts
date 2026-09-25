import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { SerializedReceivable } from '../domain/receivable.entities';
import type { ReceivableInput } from '@/lib/validators/receivable';

function serialize(row: {
  id: string;
  debtorName: string;
  amount: Prisma.Decimal;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SerializedReceivable {
  return {
    id: row.id,
    debtorName: row.debtorName,
    amount: Number(row.amount),
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const receivableRepository = {
  async findByUserId(userId: string): Promise<SerializedReceivable[]> {
    const items = await prisma.receivable.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(serialize);
  },

  async totalByUserId(userId: string): Promise<number> {
    const agg = await prisma.receivable.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return Number(agg._sum.amount ?? 0);
  },

  async create(userId: string, data: ReceivableInput): Promise<SerializedReceivable> {
    const created = await prisma.receivable.create({
      data: {
        userId,
        debtorName: data.debtorName,
        amount: new Prisma.Decimal(data.amount),
        note: data.note ?? null,
      },
    });
    return serialize(created);
  },

  async update(
    userId: string,
    id: string,
    data: Partial<ReceivableInput>,
  ): Promise<SerializedReceivable> {
    await this.assertOwnership(userId, id);
    const updated = await prisma.receivable.update({
      where: { id },
      data: {
        ...(data.debtorName !== undefined && { debtorName: data.debtorName }),
        ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
        ...(data.note !== undefined && { note: data.note }),
      },
    });
    return serialize(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.receivable.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
    const found = await prisma.receivable.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Registro não encontrado');
  },
};
