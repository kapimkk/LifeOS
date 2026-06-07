'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { investmentSchema } from './schemas';
import {
  createInvestmentCommand,
  updateInvestmentCommand,
  deleteInvestmentCommand,
  getInvestmentById,
} from '../application/commands/manage-investment.command';
import type { SerializedInvestment } from '../domain/entities';
import type { InvestmentInput } from '@/lib/validators/investment';

const INVALIDATE_PATHS = [
  '/financas',
  '/financas/investimentos',
  '/financas/gastos-fixos',
  '/investimentos',
  '/dashboard',
] as const;

function revalidate() {
  for (const path of INVALIDATE_PATHS) revalidatePath(path);
}

export async function createInvestmentAction(
  input: InvestmentInput,
): Promise<ActionResult<SerializedInvestment>> {
  try {
    const user = await requireUser();
    const data = investmentSchema.parse(input);
    const { id } = await createInvestmentCommand(user.id, data);
    const created = await getInvestmentById(user.id, id);
    revalidate();
    return actionSuccess(created!);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateInvestmentAction(
  id: string,
  input: Partial<InvestmentInput>,
): Promise<ActionResult<SerializedInvestment>> {
  try {
    const user = await requireUser();
    const data = investmentSchema.partial().parse(input);
    const { id: invId } = await updateInvestmentCommand(user.id, id, data);
    const updated = await getInvestmentById(user.id, invId);
    revalidate();
    return actionSuccess(updated!);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteInvestmentAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await deleteInvestmentCommand(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
