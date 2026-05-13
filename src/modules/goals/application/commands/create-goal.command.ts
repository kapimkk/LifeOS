import type { GoalInput } from '@/lib/validators/goal';
import { goalRepository } from '../../infrastructure/goal.repository';

export interface CreateGoalResult {
  id: string;
}

export async function createGoalCommand(
  userId: string,
  data: GoalInput,
): Promise<CreateGoalResult> {
  const goal = await goalRepository.create(userId, data);
  return { id: goal.id };
}
