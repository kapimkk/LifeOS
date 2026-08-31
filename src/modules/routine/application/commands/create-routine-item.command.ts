import type { RoutineItemInput } from '@/lib/validators/routine';
import { routineRepository } from '../../infrastructure/routine.repository';

export async function createRoutineItemCommand(userId: string, data: RoutineItemInput) {
  const item = await routineRepository.create(userId, data);
  return { id: item.id, item };
}
