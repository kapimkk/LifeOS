'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { prisma } from '@/lib/prisma';
import { transactionPatchSchema, transactionSchema } from '@/lib/validators/transaction';
import { createTransactionCommand } from '../application/commands/create-transaction.command';
import { deleteTransactionCommand } from '../application/commands/delete-transaction.command';
import { updateTransactionCommand } from '../application/commands/update-transaction.command';
import { serializeTransaction } from './serialize-transaction';
import type { SerializedTransaction } from '@/types/finance-transaction';
import type { TransactionInput } from '@/lib/validators/transaction';

const PATHS = ['/financas/lancamentos', '/dashboard'] as const;

function revalidateFinance() {
  for (const p of PATHS) revalidatePath(p);
}

export async function createTransactionAction(
  input: TransactionInput,
): Promise<ActionResult<{ items: SerializedTransaction[] }>> {
  try {
    const user = await requireUser();
    const data = transactionSchema.parse(input);
    const { ids } = await createTransactionCommand(user.id, data);
    const rows = await prisma.financialTransaction.findMany({
      where: { id: { in: ids }, userId: user.id },
      include: { category: true },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });
    const items = rows.map(serializeTransaction);
    revalidateFinance();
    return actionSuccess({ items });
  } catch (err) {
    return actionError(err);
  }
}

export async function updateTransactionAction(
  id: string,
  input: Partial<TransactionInput>,
): Promise<ActionResult<SerializedTransaction>> {
  try {
    const user = await requireUser();
    const partial = transactionPatchSchema.parse(input);

    const current = await prisma.financialTransaction.findFirst({
      where: { id, userId: user.id },
    });
    if (!current) {
      return { success: false, error: 'Transação não encontrada' };
    }

    const merged: TransactionInput = {
      type: partial.type ?? (current.type as TransactionInput['type']),
      amount: partial.amount ?? Number(current.amount),
      description: partial.description ?? current.description,
      notes: partial.notes !== undefined ? partial.notes : current.notes,
      categoryId: partial.categoryId !== undefined ? partial.categoryId : current.categoryId,
      date: partial.date ?? current.date,
      recurrence: partial.recurrence ?? (current.recurrence as TransactionInput['recurrence']),
      paymentMethod:
        partial.paymentMethod ?? (current.paymentMethod as TransactionInput['paymentMethod']),
      installments: partial.installments ?? current.installments,
    };

    const checked = transactionSchema.safeParse(merged);
    if (!checked.success) {
      return actionError(checked.error);
    }

    await updateTransactionCommand(user.id, id, partial);
    const row = await prisma.financialTransaction.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!row) return { success: false, error: 'Transação não encontrada' };
    revalidateFinance();
    return actionSuccess(serializeTransaction(row));
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await deleteTransactionCommand(user.id, id);
    revalidateFinance();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
