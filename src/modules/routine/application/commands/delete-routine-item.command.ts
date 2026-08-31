import { routineRepository } from '../../infrastructure/routine.repository';

export async function deleteRoutineItemCommand(userId: string, id: string) {
  await routineRepository.remove(userId, id);
  return { id };
}
