import type { MoodInput } from '@/types/life-balance';
import { moodRepository } from '../../infrastructure/mood.repository';

export interface SaveMoodResult {
  id: string;
}

export async function saveMoodCommand(
  userId: string,
  timezone: string,
  data: MoodInput,
): Promise<SaveMoodResult> {
  const record = await moodRepository.upsertToday(userId, timezone, data);
  return { id: record.id };
}
