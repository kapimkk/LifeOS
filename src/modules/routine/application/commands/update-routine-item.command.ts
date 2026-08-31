import type { RoutineItemInput } from '@/lib/validators/routine';
import { routineRepository } from '../../infrastructure/routine.repository';

export async function updateRoutineItemCommand(userId: string, id: string, data: RoutineItemInput) {
  const item = await routineRepository.update(userId, id, data);
  return { item };
}
