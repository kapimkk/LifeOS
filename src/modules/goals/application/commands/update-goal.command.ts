import type { GoalInput } from '@/lib/validators/goal';
import { goalRepository } from '../../infrastructure/goal.repository';

export interface UpdateGoalResult {
  id: string;
}

export async function updateGoalCommand(
  userId: string,
  id: string,
  data: Partial<GoalInput>,
): Promise<UpdateGoalResult> {
  const goal = await goalRepository.update(userId, id, data);
  return { id: goal.id };
}
