'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/shared/auth/session';
import { actionError, actionSuccess, type ActionResult } from '@/shared/types/action-result';
import { lifeBalanceSchema, moodSchema } from './schemas';
import { saveLifeBalanceCommand } from '../application/commands/save-life-balance.command';
import { saveMoodCommand } from '../application/commands/save-mood.command';
import { getLifeBalanceQuery } from '../application/queries/get-life-balance.query';
import { getTodayMoodQuery, getMoodHistoryQuery } from '../application/queries/get-mood.query';
import type {
  SerializedLifeBalance,
  LifeBalanceInput,
  SerializedMoodLog,
  MoodInput,
} from '@/types/life-balance';

export async function getLifeBalance(): Promise<SerializedLifeBalance | null> {
  const user = await requireUser();
  return getLifeBalanceQuery(user.id);
}

export async function saveLifeBalanceAction(
  input: LifeBalanceInput,
): Promise<ActionResult<SerializedLifeBalance>> {
  try {
    const user = await requireUser();
    const data = lifeBalanceSchema.parse(input);
    await saveLifeBalanceCommand(user.id, data);
    const updated = await getLifeBalanceQuery(user.id);
    revalidatePath('/roda-da-vida');
    revalidatePath('/dashboard');
    return actionSuccess(updated!);
  } catch (err) {
    return actionError(err);
  }
}

export async function getTodayMood(): Promise<SerializedMoodLog | null> {
  const user = await requireUser();
  return getTodayMoodQuery(user.id, user.timezone ?? 'America/Sao_Paulo');
}

export async function saveMoodAction(input: MoodInput): Promise<ActionResult<SerializedMoodLog>> {
  try {
    const user = await requireUser();
    const data = moodSchema.parse(input);
    const tz = user.timezone ?? 'America/Sao_Paulo';
    await saveMoodCommand(user.id, tz, data);
    const updated = await getTodayMoodQuery(user.id, tz);
    revalidatePath('/dashboard');
    return actionSuccess(updated!);
  } catch (err) {
    return actionError(err);
  }
}

export async function getMoodHistory(days = 365): Promise<SerializedMoodLog[]> {
  const user = await requireUser();
  return getMoodHistoryQuery(user.id, days);
}
