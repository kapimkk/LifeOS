import type { HabitInput } from '@/lib/validators/habit';
import { habitRepository } from '../../infrastructure/habit.repository';

export interface CreateHabitResult {
  id: string;
}

export async function createHabitCommand(
  userId: string,
  data: HabitInput,
): Promise<CreateHabitResult> {
  const habit = await habitRepository.create(userId, data);
  return { id: habit.id };
}
