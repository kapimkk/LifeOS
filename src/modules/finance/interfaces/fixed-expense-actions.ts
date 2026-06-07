'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { fixedExpenseSchema } from '@/lib/validators/fixed-expense';
import { createFixedExpenseCommand } from '../application/commands/create-fixed-expense.command';
import { updateFixedExpenseCommand } from '../application/commands/update-fixed-expense.command';
import { deleteFixedExpenseCommand } from '../application/commands/delete-fixed-expense.command';
import type { SerializedFixedExpense } from '../domain/fixed-expense.entities';
import type { FixedExpenseInput } from '@/lib/validators/fixed-expense';

const PATHS = ['/financas', '/financas/gastos-fixos', '/dashboard'] as const;

function revalidate() {
  for (const p of PATHS) revalidatePath(p);
}

export async function createFixedExpenseAction(
  input: FixedExpenseInput,
): Promise<ActionResult<SerializedFixedExpense>> {
  try {
    const user = await requireUser();
    const data = fixedExpenseSchema.parse(input);
    const { item } = await createFixedExpenseCommand(user.id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateFixedExpenseAction(
  id: string,
  input: Partial<FixedExpenseInput>,
): Promise<ActionResult<SerializedFixedExpense>> {
  try {
    const user = await requireUser();
    const data = fixedExpenseSchema.partial().parse(input);
    const { item } = await updateFixedExpenseCommand(user.id, id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteFixedExpenseAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await deleteFixedExpenseCommand(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
