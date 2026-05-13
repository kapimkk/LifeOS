'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { resourceSchema } from './schemas';
import { createResourceCommand } from '../application/commands/create-resource.command';
import {
  updateResourceCommand,
  toggleResourceDoneCommand,
} from '../application/commands/update-resource.command';
import { deleteResourceCommand } from '../application/commands/delete-resource.command';
import { resourceRepository } from '../infrastructure/resource.repository';
import type { SerializedResource } from '../domain/entities';
import type { ResourceInput } from '@/lib/validators/resource';

function revalidate() {
  revalidatePath('/recursos');
}

export async function createResourceAction(
  input: ResourceInput,
): Promise<ActionResult<SerializedResource>> {
  try {
    const user = await requireUser();
    const data = resourceSchema.parse(input);
    const { id } = await createResourceCommand(user.id, data);
    const resources = await resourceRepository.findByUserId(user.id);
    revalidate();
    return actionSuccess(resources.find((r) => r.id === id)!);
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
    await updateResourceCommand(user.id, id, data);
    const resources = await resourceRepository.findByUserId(user.id);
    revalidate();
    return actionSuccess(resources.find((r) => r.id === id)!);
  } catch (err) {
    return actionError(err);
  }
}

export async function toggleResourceDoneAction(
  id: string,
): Promise<ActionResult<SerializedResource>> {
  try {
    const user = await requireUser();
    await toggleResourceDoneCommand(user.id, id);
    const resources = await resourceRepository.findByUserId(user.id);
    revalidate();
    return actionSuccess(resources.find((r) => r.id === id)!);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteResourceAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await deleteResourceCommand(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
