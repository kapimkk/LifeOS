import type { TaskInput } from '@/lib/validators/task';
import { taskRepository } from '../../infrastructure/task.repository';

export interface UpdateTaskResult {
  id: string;
}

export async function updateTaskCommand(
  userId: string,
  id: string,
  data: Partial<TaskInput>,
): Promise<UpdateTaskResult> {
  const task = await taskRepository.update(userId, id, data);
  return { id: task.id };
}
