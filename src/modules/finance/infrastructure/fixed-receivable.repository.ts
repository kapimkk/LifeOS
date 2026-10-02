import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { SerializedFixedReceivable } from '../domain/fixed-receivable.entities';
import type { FixedReceivableInput } from '@/lib/validators/fixed-receivable';

const includePayments = { payments: true } as const;

type Row = {
  id: string;
  name: string;
  amount: Prisma.Decimal;
  dueDay: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  payments: Array<{ year: number; month: number }>;
};

function serialize(row: Row): SerializedFixedReceivable {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    dueDay: row.dueDay,
    note: row.note,
    paidMonths: row.payments
      .map((payment) => ({ year: payment.year, month: payment.month }))
      .sort((a, b) => a.year - b.year || a.month - b.month),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const fixedReceivableRepository = {
  async findByUserId(userId: string): Promise<SerializedFixedReceivable[]> {
    const items = await prisma.fixedReceivable.findMany({
      where: { userId },
      include: includePayments,
      orderBy: [{ dueDay: 'asc' }, { name: 'asc' }],
    });
    return items.map(serialize);
  },

  async create(userId: string, data: FixedReceivableInput): Promise<SerializedFixedReceivable> {
    const created = await prisma.fixedReceivable.create({
      data: {
        userId,
        name: data.name,
        amount: new Prisma.Decimal(data.amount),
        dueDay: data.dueDay,
        note: data.note ?? null,
      },
      include: includePayments,
    });
    return serialize(created);
  },

  async update(
    userId: string,
    id: string,
    data: Partial<FixedReceivableInput>,
  ): Promise<SerializedFixedReceivable> {
    await this.assertOwnership(userId, id);
    const updated = await prisma.fixedReceivable.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
        ...(data.dueDay !== undefined && { dueDay: data.dueDay }),
        ...(data.note !== undefined && { note: data.note }),
      },
      include: includePayments,
    });
    return serialize(updated);
  },

  async setMonthPaid(
    userId: string,
    id: string,
    year: number,
    month: number,
    paid: boolean,
  ): Promise<SerializedFixedReceivable> {
    await this.assertOwnership(userId, id);
    if (paid) {
      await prisma.fixedReceivablePayment.upsert({
        where: {
          fixedReceivableId_year_month: { fixedReceivableId: id, year, month },
        },
        create: { fixedReceivableId: id, year, month },
        update: {},
      });
    } else {
      await prisma.fixedReceivablePayment.deleteMany({
        where: { fixedReceivableId: id, year, month },
      });
    }
    const updated = await prisma.fixedReceivable.findUniqueOrThrow({
      where: { id },
      include: includePayments,
    });
    return serialize(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.fixedReceivable.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
    const found = await prisma.fixedReceivable.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Recebimento fixo não encontrado');
  },
};
