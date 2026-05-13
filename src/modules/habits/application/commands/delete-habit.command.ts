import { habitRepository } from '../../infrastructure/habit.repository';

export async function deleteHabitCommand(userId: string, id: string): Promise<void> {
  await habitRepository.remove(userId, id);
}
