import { taskRepository } from '../../infrastructure/task.repository';

export async function listTasksQuery(userId: string, status?: string) {
  return taskRepository.findByUserId(userId, status);
}

export async function getTaskStatsQuery(userId: string) {
  return taskRepository.stats(userId);
}
