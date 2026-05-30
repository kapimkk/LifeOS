'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { journeySchema, journeyStepSchema } from '@/lib/validators/journey';
import { createJourneyCommand } from '../application/commands/create-journey.command';
import { addStepToJourneyCommand } from '../application/commands/add-step-to-journey.command';
import { completeStepCommand } from '../application/commands/complete-step.command';
import { getJourneyWithStepsQuery } from '../application/queries/get-journey-with-steps.query';
import { serializeJourney } from './serialize-journey';
import type { SerializedJourney } from '../domain/entities';

const PATH = '/jornada';

function revalidateJourney() {
  revalidatePath(PATH);
}

export async function createJourneyAction(
  input: Parameters<typeof journeySchema.parse>[0],
): Promise<ActionResult<SerializedJourney>> {
  try {
    const user = await requireUser();
    const data = journeySchema.parse(input);
    const { id } = await createJourneyCommand(user.id, data);
    const row = await getJourneyWithStepsQuery(user.id, id);
    if (!row) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serializeJourney(row));
  } catch (err) {
    return actionError(err);
  }
}

export async function addStepToJourneyAction(
  input: Parameters<typeof journeyStepSchema.parse>[0],
): Promise<ActionResult<SerializedJourney>> {
  try {
    const user = await requireUser();
    const data = journeyStepSchema.parse(input);
    const { journeyId } = await addStepToJourneyCommand(user.id, data);
    const row = await getJourneyWithStepsQuery(user.id, journeyId);
    if (!row) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serializeJourney(row));
  } catch (err) {
    return actionError(err);
  }
}

export async function completeStepAction(stepId: string): Promise<ActionResult<SerializedJourney>> {
  try {
    const user = await requireUser();
    const { journeyId } = await completeStepCommand(user.id, stepId);
    const row = await getJourneyWithStepsQuery(user.id, journeyId);
    if (!row) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serializeJourney(row));
  } catch (err) {
    return actionError(err);
  }
}
