import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { transactionSchema } from '@/lib/validators/transaction';
import { requireUser } from '@/server/auth/session';
import { transactionsService } from '@/server/services/transactions';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;
    const data = await transactionsService.list(user.id, {
      type: (sp.get('type') as 'INCOME' | 'EXPENSE') ?? undefined,
      categoryId: sp.get('categoryId') ?? undefined,
      search: sp.get('search') ?? undefined,
      from: sp.get('from') ? new Date(sp.get('from')!) : undefined,
      to: sp.get('to') ? new Date(sp.get('to')!) : undefined,
    });
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, transactionSchema);
    const data = await transactionsService.create(user.id, body);
    return created(data);
  } catch (err) {
    return handleApiError(err);
  }
}
