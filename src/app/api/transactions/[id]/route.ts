import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { transactionSchema } from '@/lib/validators/transaction';
import { requireUser } from '@/server/auth/session';
import { transactionsService } from '@/server/services/transactions';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, transactionSchema.partial());
    const data = await transactionsService.update(user.id, id, body);
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await transactionsService.remove(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
