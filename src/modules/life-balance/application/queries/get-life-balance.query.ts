import { lifeBalanceRepository } from '../../infrastructure/life-balance.repository';

export async function getLifeBalanceQuery(userId: string) {
  return lifeBalanceRepository.findByUserId(userId);
}
