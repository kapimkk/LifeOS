import type { HabitInput } from '@/lib/validators/habit';
import { habitRepository } from '../../infrastructure/habit.repository';

export interface UpdateHabitResult {
  id: string;
}

export async function updateHabitCommand(
  userId: string,
  id: string,
  data: Partial<HabitInput>,
): Promise<UpdateHabitResult> {
  const habit = await habitRepository.update(userId, id, data);
  return { id: habit.id };
}
