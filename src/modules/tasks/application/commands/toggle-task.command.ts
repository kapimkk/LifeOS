import { taskRepository } from '../../infrastructure/task.repository';

export interface ToggleTaskResult {
  id: string;
  status: string;
}

export async function toggleTaskCommand(userId: string, id: string): Promise<ToggleTaskResult> {
  const task = await taskRepository.toggle(userId, id);
  return { id: task.id, status: task.status };
}
