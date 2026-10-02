'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import {
  fixedReceivableMonthSchema,
  fixedReceivableSchema,
  type FixedReceivableInput,
} from '@/lib/validators/fixed-receivable';
import { createFixedReceivableCommand } from '../application/commands/create-fixed-receivable.command';
import { updateFixedReceivableCommand } from '../application/commands/update-fixed-receivable.command';
import { deleteFixedReceivableCommand } from '../application/commands/delete-fixed-receivable.command';
import { setFixedReceivableMonthCommand } from '../application/commands/set-fixed-receivable-month.command';
import type { SerializedFixedReceivable } from '../domain/fixed-receivable.entities';

const PATHS = ['/financas', '/financas/a-receber', '/financas/a-receber/fixos'] as const;

function revalidate() {
  for (const path of PATHS) revalidatePath(path);
}

export async function createFixedReceivableAction(
  input: FixedReceivableInput,
): Promise<ActionResult<SerializedFixedReceivable>> {
  try {
    const user = await requireUser();
    const data = fixedReceivableSchema.parse(input);
    const { item } = await createFixedReceivableCommand(user.id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateFixedReceivableAction(
  id: string,
  input: Partial<FixedReceivableInput>,
): Promise<ActionResult<SerializedFixedReceivable>> {
  try {
    const user = await requireUser();
    const data = fixedReceivableSchema.partial().parse(input);
    const { item } = await updateFixedReceivableCommand(user.id, id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function setFixedReceivableMonthAction(
  id: string,
  year: number,
  month: number,
  paid: boolean,
): Promise<ActionResult<SerializedFixedReceivable>> {
  try {
    const user = await requireUser();
    const data = fixedReceivableMonthSchema.parse({ year, month, paid });
    const { item } = await setFixedReceivableMonthCommand(
      user.id,
      id,
      data.year,
      data.month,
      data.paid,
    );
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteFixedReceivableAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await deleteFixedReceivableCommand(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
