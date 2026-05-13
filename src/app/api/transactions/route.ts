import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { resolveFinancePeriod } from '@/app/(app)/financas/finance-period';
import { transactionSchema } from '@/modules/finance/interfaces/schemas';
import { listTransactionsQuery } from '@/modules/finance/application/queries/list-transactions.query';
import { createTransactionCommand } from '@/modules/finance/application/commands/create-transaction.command';
import type { TransactionFilters } from '@/modules/finance/domain/entities';
import { transactionRepository } from '@/modules/finance/infrastructure/transaction.repository';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;

    const from = sp.get('from');
    const to = sp.get('to');
    const filters: TransactionFilters =
      from || to
        ? {
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            type: (sp.get('type') as 'INCOME' | 'EXPENSE') ?? undefined,
            categoryId: sp.get('categoryId') ?? undefined,
            search: sp.get('search') ?? undefined,
          }
        : {
            ...resolveFinancePeriod({
              view: sp.get('view') ?? undefined,
              d: sp.get('d') ?? undefined,
              m: sp.get('m') ?? undefined,
              y: sp.get('y') ?? undefined,
            }).listFilters,
            type: (sp.get('type') as 'INCOME' | 'EXPENSE') ?? undefined,
            categoryId: sp.get('categoryId') ?? undefined,
            search: sp.get('search') ?? undefined,
          };

    return ok(await listTransactionsQuery(user.id, filters));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, transactionSchema);
    const { ids } = await createTransactionCommand(user.id, body);
    const rows = await transactionRepository.findManyByIds(user.id, ids);
    return created({ items: rows, ids });
  } catch (err) {
    return handleApiError(err);
  }
}
