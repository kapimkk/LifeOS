import { habitRepository } from '../../infrastructure/habit.repository';

export interface ToggleHabitResult {
  done: boolean;
}

export async function toggleHabitCommand(
  userId: string,
  habitId: string,
  timezone?: string,
): Promise<ToggleHabitResult> {
  return habitRepository.toggleToday(userId, habitId, timezone);
}
