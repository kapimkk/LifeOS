'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { routineItemSchema } from './schemas';
import { createRoutineItemCommand } from '../application/commands/create-routine-item.command';
import { updateRoutineItemCommand } from '../application/commands/update-routine-item.command';
import { deleteRoutineItemCommand } from '../application/commands/delete-routine-item.command';
import type { SerializedRoutineItem } from '../domain/entities';
import type { RoutineItemInput } from '@/lib/validators/routine';

const PATH = '/rotina';

function revalidate() {
  revalidatePath(PATH);
}

export async function createRoutineItemAction(
  input: RoutineItemInput,
): Promise<ActionResult<SerializedRoutineItem>> {
  try {
    const user = await requireUser();
    const data = routineItemSchema.parse(input);
    const { item } = await createRoutineItemCommand(user.id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateRoutineItemAction(
  id: string,
  input: RoutineItemInput,
): Promise<ActionResult<SerializedRoutineItem>> {
  try {
    const user = await requireUser();
    const data = routineItemSchema.parse(input);
    const { item } = await updateRoutineItemCommand(user.id, id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteRoutineItemAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await deleteRoutineItemCommand(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
