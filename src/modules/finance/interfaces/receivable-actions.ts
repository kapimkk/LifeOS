'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { receivableSchema } from '@/lib/validators/receivable';
import { createReceivableCommand } from '../application/commands/create-receivable.command';
import { updateReceivableCommand } from '../application/commands/update-receivable.command';
import { deleteReceivableCommand } from '../application/commands/delete-receivable.command';
import type { SerializedReceivable } from '../domain/receivable.entities';
import type { ReceivableInput } from '@/lib/validators/receivable';

const PATHS = ['/financas', '/financas/a-receber'] as const;

function revalidate() {
  for (const path of PATHS) revalidatePath(path);
}

export async function createReceivableAction(
  input: ReceivableInput,
): Promise<ActionResult<SerializedReceivable>> {
  try {
    const user = await requireUser();
    const data = receivableSchema.parse(input);
    const { item } = await createReceivableCommand(user.id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateReceivableAction(
  id: string,
  input: Partial<ReceivableInput>,
): Promise<ActionResult<SerializedReceivable>> {
  try {
    const user = await requireUser();
    const data = receivableSchema.partial().parse(input);
    const { item } = await updateReceivableCommand(user.id, id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteReceivableAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await deleteReceivableCommand(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
