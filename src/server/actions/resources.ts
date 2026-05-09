'use server';

import { revalidatePath } from 'next/cache';
import { resourceSchema, type ResourceInput } from '@/lib/validators/resource';
import { requireUser } from '@/server/auth/session';
import { resourcesService, type SerializedResource } from '@/server/services/resources';
import { actionError, actionSuccess, type ActionResult } from './_helpers';

function revalidate() {
  revalidatePath('/recursos');
}

export async function createResourceAction(
  input: ResourceInput,
): Promise<ActionResult<SerializedResource>> {
  try {
    const user = await requireUser();
    const data = resourceSchema.parse(input);
    const created = await resourcesService.create(user.id, data);
    revalidate();
    return actionSuccess(created);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateResourceAction(
  id: string,
  input: Partial<ResourceInput>,
): Promise<ActionResult<SerializedResource>> {
  try {
    const user = await requireUser();
    const data = resourceSchema.partial().parse(input);
    const updated = await resourcesService.update(user.id, id, data);
    revalidate();
    return actionSuccess(updated);
  } catch (err) {
    return actionError(err);
  }
}

export async function toggleResourceDoneAction(
  id: string,
): Promise<ActionResult<SerializedResource>> {
  try {
    const user = await requireUser();
    const updated = await resourcesService.toggleDone(user.id, id);
    revalidate();
    return actionSuccess(updated);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteResourceAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await resourcesService.remove(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
