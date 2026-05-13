import type { TaskInput } from '@/lib/validators/task';
import { taskRepository } from '../../infrastructure/task.repository';

export interface CreateTaskResult {
  id: string;
}

export async function createTaskCommand(
  userId: string,
  data: TaskInput,
): Promise<CreateTaskResult> {
  const task = await taskRepository.create(userId, data);
  return { id: task.id };
}
