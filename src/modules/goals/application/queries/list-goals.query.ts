import { goalRepository } from '../../infrastructure/goal.repository';

export async function listGoalsQuery(userId: string, status?: string) {
  return goalRepository.findByUserId(userId, status);
}

export async function getGoalStatsQuery(userId: string) {
  return goalRepository.stats(userId);
}
