import { habitRepository } from '../../infrastructure/habit.repository';

export async function listHabitsWithStatsQuery(userId: string, timezone?: string) {
  return habitRepository.findWithStats(userId, timezone);
}

export async function getHabitsTodaySummaryQuery(userId: string, timezone?: string) {
  return habitRepository.todaySummary(userId, timezone);
}
