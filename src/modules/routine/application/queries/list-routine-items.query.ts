import { routineRepository } from '../../infrastructure/routine.repository';

export async function listRoutineItemsQuery(userId: string) {
  return routineRepository.findByUserId(userId);
}
