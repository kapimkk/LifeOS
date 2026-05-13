import { goalRepository } from '../../infrastructure/goal.repository';

export async function deleteGoalCommand(userId: string, id: string): Promise<void> {
  await goalRepository.remove(userId, id);
}
