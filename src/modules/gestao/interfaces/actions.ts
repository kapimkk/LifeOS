'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import {
  customerSchema,
  projectSchema,
  vpsSchema,
  type CustomerInput,
  type ProjectInput,
  type VpsInput,
} from '@/lib/validators/gestao';
import { gestaoRepository } from '../infrastructure/gestao.repository';
import type { SerializedCustomer, SerializedProject, SerializedVps } from '../domain/entities';

const PATHS = ['/gestao', '/gestao/projetos', '/gestao/clientes', '/gestao/vps'] as const;

function revalidate() {
  for (const path of PATHS) revalidatePath(path);
}

export async function createCustomerAction(
  input: CustomerInput,
): Promise<ActionResult<SerializedCustomer>> {
  try {
    const user = await requireUser();
    const data = customerSchema.parse(input);
    const item = await gestaoRepository.createCustomer(user.id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateCustomerAction(
  id: string,
  input: CustomerInput,
): Promise<ActionResult<SerializedCustomer>> {
  try {
    const user = await requireUser();
    const data = customerSchema.parse(input);
    const item = await gestaoRepository.updateCustomer(user.id, id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await gestaoRepository.deleteCustomer(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}

export async function createVpsAction(input: VpsInput): Promise<ActionResult<SerializedVps>> {
  try {
    const user = await requireUser();
    const data = vpsSchema.parse(input);
    const item = await gestaoRepository.createServer(user.id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateVpsAction(
  id: string,
  input: VpsInput,
): Promise<ActionResult<SerializedVps>> {
  try {
    const user = await requireUser();
    const data = vpsSchema.parse(input);
    const item = await gestaoRepository.updateServer(user.id, id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteVpsAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await gestaoRepository.deleteServer(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}

export async function createProjectAction(
  input: ProjectInput,
): Promise<ActionResult<SerializedProject>> {
  try {
    const user = await requireUser();
    const data = projectSchema.parse(input);
    const item = await gestaoRepository.createProject(user.id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateProjectAction(
  id: string,
  input: ProjectInput,
): Promise<ActionResult<SerializedProject>> {
  try {
    const user = await requireUser();
    const data = projectSchema.parse(input);
    const item = await gestaoRepository.updateProject(user.id, id, data);
    revalidate();
    return actionSuccess(item);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await gestaoRepository.deleteProject(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
