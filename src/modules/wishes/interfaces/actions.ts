'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { wishSchema } from './schemas';
import { createWishCommand } from '../application/commands/create-wish.command';
import { updateWishCommand } from '../application/commands/update-wish.command';
import { deleteWishCommand } from '../application/commands/delete-wish.command';
import type { SerializedWishItem } from '../domain/entities';
import type { WishInput } from '@/lib/validators/wish';

const PATH = '/desejos';

function revalidate() {
  revalidatePath(PATH);
}

export async function createWishAction(
  input: WishInput,
): Promise<ActionResult<SerializedWishItem>> {
  try {
    const user = await requireUser();
    const data = wishSchema.parse(input);
    const { item } = await createWishCommand(user.id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateWishAction(
  id: string,
  input: Partial<WishInput>,
): Promise<ActionResult<SerializedWishItem>> {
  try {
    const user = await requireUser();
    const data = wishSchema.partial().parse(input);
    const { item } = await updateWishCommand(user.id, id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteWishAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await deleteWishCommand(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
