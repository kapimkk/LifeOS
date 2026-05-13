import { moodRepository } from '../../infrastructure/mood.repository';

export async function getTodayMoodQuery(userId: string, timezone: string) {
  return moodRepository.findToday(userId, timezone);
}

export async function getMoodHistoryQuery(userId: string, days = 365) {
  return moodRepository.findHistory(userId, days);
}
