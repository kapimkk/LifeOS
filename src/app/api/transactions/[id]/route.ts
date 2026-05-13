import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { transactionPatchSchema } from '@/lib/validators/transaction';
import { updateTransactionCommand } from '@/modules/finance/application/commands/update-transaction.command';
import { deleteTransactionCommand } from '@/modules/finance/application/commands/delete-transaction.command';
import { transactionRepository } from '@/modules/finance/infrastructure/transaction.repository';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, transactionPatchSchema);
    const { id: txId } = await updateTransactionCommand(user.id, id, body);
    const txs = await transactionRepository.findManyByIds(user.id, [txId]);
    return ok(txs[0] ?? null);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteTransactionCommand(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
