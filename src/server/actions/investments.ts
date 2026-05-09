'use server';

import { revalidatePath } from 'next/cache';
import { investmentSchema, type InvestmentInput } from '@/lib/validators/investment';
import { requireUser } from '@/server/auth/session';
import { investmentsService, type SerializedInvestment } from '@/server/services/investments';
import { actionError, actionSuccess, type ActionResult } from './_helpers';

const INVALIDATE_PATHS = ['/financas', '/dashboard'] as const;

function revalidate() {
  for (const path of INVALIDATE_PATHS) revalidatePath(path);
}

export async function createInvestmentAction(
  input: InvestmentInput,
): Promise<ActionResult<SerializedInvestment>> {
  try {
    const user = await requireUser();
    const data = investmentSchema.parse(input);
    const created = await investmentsService.create(user.id, data);
    revalidate();
    return actionSuccess(created);
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
    const updated = await investmentsService.update(user.id, id, data);
    revalidate();
    return actionSuccess(updated);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteInvestmentAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    await investmentsService.remove(user.id, id);
    revalidate();
    return actionSuccess({ id });
  } catch (err) {
    return actionError(err);
  }
}
