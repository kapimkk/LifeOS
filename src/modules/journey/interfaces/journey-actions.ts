'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import {
  journeySchema,
  journeyStepSchema,
  updateJourneyStepSchema,
} from '@/lib/validators/journey';
import { createJourneyCommand } from '../application/commands/create-journey.command';
import { addStepToJourneyCommand } from '../application/commands/add-step-to-journey.command';
import { completeStepCommand } from '../application/commands/complete-step.command';
import { updateJourneyCommand } from '../application/commands/update-journey.command';
import { deleteJourneyCommand } from '../application/commands/delete-journey.command';
import { updateStepCommand } from '../application/commands/update-step.command';
import { deleteStepCommand } from '../application/commands/delete-step.command';
import { getJourneyWithStepsQuery } from '../application/queries/get-journey-with-steps.query';
import { listJourneysQuery } from '../application/queries/list-journeys.query';
import { serializeJourney } from './serialize-journey';
import type { SerializedJourney } from '../domain/entities';

const PATH = '/jornada';

function revalidateJourney() {
  revalidatePath(PATH);
}

async function loadSerialized(userId: string, journeyId: string) {
  const row = await getJourneyWithStepsQuery(userId, journeyId);
  if (!row) return null;
  return serializeJourney(row);
}

export async function createJourneyAction(
  input: Parameters<typeof journeySchema.parse>[0],
): Promise<ActionResult<SerializedJourney>> {
  try {
    const user = await requireUser();
    const data = journeySchema.parse(input);
    const { id } = await createJourneyCommand(user.id, data);
    const serialized = await loadSerialized(user.id, id);
    if (!serialized) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serialized);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateJourneyAction(
  journeyId: string,
  input: Parameters<typeof journeySchema.parse>[0],
): Promise<ActionResult<SerializedJourney>> {
  try {
    const user = await requireUser();
    const data = journeySchema.parse(input);
    await updateJourneyCommand(user.id, journeyId, data);
    const serialized = await loadSerialized(user.id, journeyId);
    if (!serialized) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serialized);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteJourneyAction(
  journeyId: string,
): Promise<ActionResult<{ deletedId: string; journeys: SerializedJourney[] }>> {
  try {
    const user = await requireUser();
    await deleteJourneyCommand(user.id, journeyId);
    const rows = await listJourneysQuery(user.id);
    revalidateJourney();
    return actionSuccess({
      deletedId: journeyId,
      journeys: rows.map((j) =>
        serializeJourney({
          id: j.id,
          userId: j.userId,
          name: j.name,
          description: j.description,
          createdAt: j.createdAt,
          steps: j.steps.map((s) => ({
            id: s.id,
            journeyId: s.journeyId,
            title: s.title,
            description: s.description,
            url: s.url,
            instructor: s.instructor,
            difficulty: s.difficulty,
            xpReward: s.xpReward,
            order: s.order,
            status: s.status as 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED',
          })),
        }),
      ),
    });
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
    const serialized = await loadSerialized(user.id, journeyId);
    if (!serialized) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serialized);
  } catch (err) {
    return actionError(err);
  }
}

export async function updateStepAction(
  stepId: string,
  input: Parameters<typeof updateJourneyStepSchema.parse>[0],
): Promise<ActionResult<SerializedJourney>> {
  try {
    const user = await requireUser();
    const data = updateJourneyStepSchema.parse(input);
    const { journeyId } = await updateStepCommand(user.id, stepId, data);
    const serialized = await loadSerialized(user.id, journeyId);
    if (!serialized) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serialized);
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteStepAction(stepId: string): Promise<ActionResult<SerializedJourney>> {
  try {
    const user = await requireUser();
    const { journeyId } = await deleteStepCommand(user.id, stepId);
    const serialized = await loadSerialized(user.id, journeyId);
    if (!serialized) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serialized);
  } catch (err) {
    return actionError(err);
  }
}

export async function completeStepAction(stepId: string): Promise<ActionResult<SerializedJourney>> {
  try {
    const user = await requireUser();
    const { journeyId } = await completeStepCommand(user.id, stepId);
    const serialized = await loadSerialized(user.id, journeyId);
    if (!serialized) return { success: false, error: 'Jornada não encontrada' };
    revalidateJourney();
    return actionSuccess(serialized);
  } catch (err) {
    return actionError(err);
  }
}
