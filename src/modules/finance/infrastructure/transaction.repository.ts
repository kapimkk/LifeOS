import 'server-only';
import {
  Prisma,
  TransactionType as PrismaTransactionType,
  type PaymentMethod as PrismaPaymentMethod,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { TransactionFilters } from '../domain/entities';
import type { TransactionInput } from '@/lib/validators/transaction';
import {
  buildCreditCardInstallmentDates,
  splitInstallmentAmounts,
} from '../domain/installment-rules';

function resolveDateRange(
  filters: TransactionFilters,
): { gte?: Date; lte?: Date; lt?: Date } | undefined {
  if (filters.from || filters.to) {
    const r: { gte?: Date; lte?: Date } = {};
    if (filters.from) r.gte = filters.from;
    if (filters.to) r.lte = filters.to;
    return r;
  }
  if (filters.day) {
    const [y, mo, da] = filters.day.split('-').map((n) => parseInt(n, 10));
    if (!y || !mo || !da) return undefined;
    const gte = new Date(y, mo - 1, da, 0, 0, 0, 0);
    const lte = new Date(y, mo - 1, da, 23, 59, 59, 999);
    return { gte, lte };
  }
  if (filters.year !== undefined && filters.month !== undefined) {
    const gte = new Date(filters.year, filters.month, 1);
    const lt = new Date(filters.year, filters.month + 1, 1);
    return { gte, lt };
  }
  if (filters.year !== undefined) {
    const gte = new Date(filters.year, 0, 1);
    const lt = new Date(filters.year + 1, 0, 1);
    return { gte, lt };
  }
  return undefined;
}

function isCreditCharge(t: { paymentMethod: PrismaPaymentMethod; isCreditCard: boolean }) {
  return t.paymentMethod === 'CREDIT_CARD' || t.isCreditCard;
}

type SummaryRow = {
  type: PrismaTransactionType;
  amount: Prisma.Decimal;
  paymentMethod: PrismaPaymentMethod;
  isCreditCard: boolean;
};

function aggregatePeriod(items: SummaryRow[]) {
  let income = 0;
  let expenseCash = 0;
  let invoiceCreditCard = 0;
  for (const t of items) {
    const v = Number(t.amount);
    if (t.type === 'INCOME') income += v;
    else if (isCreditCharge(t)) invoiceCreditCard += v;
    else expenseCash += v;
  }
  const expenseTotal = expenseCash + invoiceCreditCard;
  return {
    income,
    expenseCash,
    invoiceCreditCard,
    expenseTotal,
    balanceCash: income - expenseCash,
    balanceIncludingCard: income - expenseTotal,
  };
}

export const transactionRepository = {
  async findByUserId(userId: string, filters: TransactionFilters = {}) {
    const where: Prisma.FinancialTransactionWhereInput = { userId };
    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.search) where.description = { contains: filters.search, mode: 'insensitive' };

    const range = resolveDateRange(filters);
    if (range) {
      where.date = {};
      if ('gte' in range && range.gte) where.date.gte = range.gte;
      if ('lte' in range && range.lte) where.date.lte = range.lte;
      if ('lt' in range && range.lt) where.date.lt = range.lt;
    }

    return prisma.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { category: true },
    });
  },

  async createSingle(
    userId: string,
    data: TransactionInput & {
      date: Date;
      isCreditCard: boolean;
      installmentGroupId?: string | null;
      installmentNumber?: number | null;
    },
  ) {
    return prisma.financialTransaction.create({
      data: {
        userId,
        type: data.type,
        amount: new Prisma.Decimal(data.amount),
        description: data.description,
        notes: data.notes ?? null,
        categoryId: data.categoryId ?? null,
        date: data.date,
        recurrence: data.recurrence,
        paymentMethod: data.paymentMethod as PrismaPaymentMethod,
        installments: data.installments,
        isCreditCard: data.isCreditCard,
        installmentGroupId: data.installmentGroupId ?? null,
        installmentNumber: data.installmentNumber ?? null,
      },
      include: { category: true },
    });
  },

  async createFromInput(userId: string, data: TransactionInput) {
    const isCC = data.type === 'EXPENSE' && data.paymentMethod === 'CREDIT_CARD';
    const purchaseAnchor = new Date(data.date);

    if (isCC && data.installments > 1) {
      const groupId = crypto.randomUUID();
      const amounts = splitInstallmentAmounts(data.amount, data.installments);
      const dates = buildCreditCardInstallmentDates(purchaseAnchor, data.installments);
      const rows: Awaited<ReturnType<typeof prisma.financialTransaction.create>>[] = [];
      for (let i = 0; i < data.installments; i++) {
        const desc =
          data.installments > 1
            ? `${data.description} (${i + 1}/${data.installments})`
            : data.description;
        const row = await prisma.financialTransaction.create({
          data: {
            userId,
            type: data.type,
            amount: new Prisma.Decimal(amounts[i]),
            description: desc,
            notes: data.notes ?? null,
            categoryId: data.categoryId ?? null,
            date: dates[i],
            recurrence: 'NONE',
            paymentMethod: 'CREDIT_CARD',
            installments: data.installments,
            isCreditCard: true,
            installmentGroupId: groupId,
            installmentNumber: i + 1,
          },
          include: { category: true },
        });
        rows.push(row);
      }
      return { rows, primaryId: rows[0]!.id };
    }

    if (isCC && data.installments === 1) {
      const [dueDate] = buildCreditCardInstallmentDates(purchaseAnchor, 1);
      const row = await this.createSingle(userId, {
        ...data,
        date: dueDate,
        isCreditCard: true,
        installments: 1,
        recurrence: 'NONE',
      });
      return { rows: [row], primaryId: row.id };
    }

    const row = await this.createSingle(userId, {
      ...data,
      date: purchaseAnchor,
      isCreditCard: false,
      installments: data.installments,
    });
    return { rows: [row], primaryId: row.id };
  },

  async update(userId: string, id: string, data: Partial<TransactionInput>) {
    await this.assertOwnership(userId, id);

    const current = await prisma.financialTransaction.findUniqueOrThrow({
      where: { id },
      select: {
        type: true,
        paymentMethod: true,
        installments: true,
      },
    });

    const nextType = data.type ?? current.type;
    const nextPM = (data.paymentMethod ?? current.paymentMethod) as PrismaPaymentMethod;
    const nextInstallments =
      data.installments !== undefined ? data.installments : current.installments;

    const patch: Prisma.FinancialTransactionUpdateInput = {};
    if (data.type !== undefined) patch.type = data.type;
    if (data.amount !== undefined) patch.amount = new Prisma.Decimal(data.amount);
    if (data.description !== undefined) patch.description = data.description;
    if (data.notes !== undefined) patch.notes = data.notes ?? null;
    if (data.categoryId !== undefined) {
      patch.category = data.categoryId
        ? { connect: { id: data.categoryId } }
        : { disconnect: true };
    }
    if (data.date !== undefined) patch.date = new Date(data.date);
    if (data.recurrence !== undefined) patch.recurrence = data.recurrence;
    if (data.paymentMethod !== undefined)
      patch.paymentMethod = data.paymentMethod as PrismaPaymentMethod;
    if (data.installments !== undefined) patch.installments = data.installments;

    const isCc = nextType === 'EXPENSE' && nextPM === 'CREDIT_CARD';
    patch.isCreditCard = isCc;
    if (!isCc && data.installments === undefined && nextInstallments !== 1) {
      patch.installments = 1;
    }

    return prisma.financialTransaction.update({
      where: { id },
      data: patch,
      include: { category: true },
    });
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.financialTransaction.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
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

  async findManyByIds(userId: string, ids: string[]) {
    if (ids.length === 0) return [];
    return prisma.financialTransaction.findMany({
      where: { userId, id: { in: ids } },
      include: { category: true },
      orderBy: [{ date: 'asc' }, { installmentNumber: 'asc' }],
    });
  },

  async monthlySummary(userId: string, year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    const items = await prisma.financialTransaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
      select: { type: true, amount: true, paymentMethod: true, isCreditCard: true },
    });
    return aggregatePeriod(items);
  },

  async dailySummary(userId: string, ymd: string) {
    const [y, mo, da] = ymd.split('-').map((n) => parseInt(n, 10));
    const gte = new Date(y, mo - 1, da, 0, 0, 0, 0);
    const lte = new Date(y, mo - 1, da, 23, 59, 59, 999);
    const items = await prisma.financialTransaction.findMany({
      where: { userId, date: { gte, lte } },
      select: { type: true, amount: true, paymentMethod: true, isCreditCard: true },
    });
    return aggregatePeriod(items);
  },

  async yearlySummary(userId: string, year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const items = await prisma.financialTransaction.findMany({
      where: { userId, date: { gte: start, lt: end } },
      select: { type: true, amount: true, paymentMethod: true, isCreditCard: true },
    });
    return aggregatePeriod(items);
  },

  async balanceAllTime(userId: string) {
    const items = await prisma.financialTransaction.findMany({
      where: { userId },
      select: { type: true, amount: true, paymentMethod: true, isCreditCard: true },
    });
    return aggregatePeriod(items);
  },

  async monthlySeries(userId: string, months = 6) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const items = await prisma.financialTransaction.findMany({
      where: { userId, date: { gte: start } },
      select: { type: true, amount: true, date: true },
    });
    const buckets: Record<string, { income: number; expense: number; label: string; key: string }> =
      {};
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

  async byCategoryForRange(userId: string, gte: Date, lt: Date) {
    const grouped = await prisma.financialTransaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte, lt } },
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

  async byCategory(userId: string, year: number, month: number) {
    return this.byCategoryForRange(userId, new Date(year, month, 1), new Date(year, month + 1, 1));
  },
};
