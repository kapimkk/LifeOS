import { taskRepository } from '../../infrastructure/task.repository';

export async function deleteTaskCommand(userId: string, id: string): Promise<void> {
  await taskRepository.remove(userId, id);
}
