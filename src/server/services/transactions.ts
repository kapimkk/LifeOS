import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { TransactionInput } from '@/lib/validators/transaction';

export interface TransactionFilters {
  from?: Date;
  to?: Date;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  search?: string;
}

export const transactionsService = {
  list(userId: string, filters: TransactionFilters = {}) {
    const where: Prisma.FinancialTransactionWhereInput = { userId };

    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.search)
      where.description = { contains: filters.search, mode: 'insensitive' };
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = filters.from;
      if (filters.to) where.date.lte = filters.to;
    }

    return prisma.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { category: true },
    });
  },

  create(userId: string, data: TransactionInput) {
    return prisma.financialTransaction.create({
      data: {
        userId,
        type: data.type,
        amount: new Prisma.Decimal(data.amount),
        description: data.description,
        notes: data.notes ?? null,
        categoryId: data.categoryId ?? null,
        date: new Date(data.date),
        recurrence: data.recurrence,
      },
      include: { category: true },
    });
  },

  async update(userId: string, id: string, data: Partial<TransactionInput>) {
    await this.assertOwnership(userId, id);
    return prisma.financialTransaction.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.amount !== undefined && { amount: new Prisma.Decimal(data.amount) }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId ?? null }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.recurrence !== undefined && { recurrence: data.recurrence }),
      },
      include: { category: true },
    });
  },

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    await prisma.financialTransaction.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string) {
    const found = await prisma.financialTransaction.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) {
      const err = new Error('Transação não encontrada') as Error & { status?: number };
      err.status = 404;
      throw err;
    }
  },

  async monthlySummary(userId: string, year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    const items = await prisma.financialTransaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
    });
    let income = 0;
    let expense = 0;
    for (const t of items) {
      const v = Number(t.amount);
      if (t.type === 'INCOME') income += v;
      else expense += v;
    }
    return { income, expense, balance: income - expense };
  },

  async balanceAllTime(userId: string) {
    const agg = await prisma.financialTransaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    });
    let income = 0;
    let expense = 0;
    for (const row of agg) {
      const v = Number(row._sum.amount ?? 0);
      if (row.type === 'INCOME') income += v;
      else expense += v;
    }
    return { income, expense, balance: income - expense };
  },

  async monthlySeries(userId: string, months = 6) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const items = await prisma.financialTransaction.findMany({
      where: { userId, date: { gte: start } },
      select: { type: true, amount: true, date: true },
    });

    const buckets: Record<string, { income: number; expense: number; label: string; key: string }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = {
        key,
        income: 0,
        expense: 0,
        label: d.toLocaleDateString('pt-BR', { month: 'short' }),
      };
    }

    for (const t of items) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      const bucket = buckets[key];
      if (!bucket) continue;
      if (t.type === 'INCOME') bucket.income += Number(t.amount);
      else bucket.expense += Number(t.amount);
    }

    return Object.values(buckets);
  },

  async byCategory(userId: string, year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const grouped = await prisma.financialTransaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    const ids = grouped.map((g) => g.categoryId).filter(Boolean) as string[];
    const cats = await prisma.category.findMany({ where: { id: { in: ids } } });
    const catMap = new Map(cats.map((c) => [c.id, c]));

    return grouped
      .map((g) => ({
        categoryId: g.categoryId,
        name: g.categoryId ? (catMap.get(g.categoryId)?.name ?? 'Sem categoria') : 'Sem categoria',
        color: g.categoryId ? (catMap.get(g.categoryId)?.color ?? '#94a3b8') : '#94a3b8',
        value: Number(g._sum.amount ?? 0),
      }))
      .sort((a, b) => b.value - a.value);
  },
};
