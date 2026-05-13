import type { LifeBalanceInput } from '@/types/life-balance';
import { lifeBalanceRepository } from '../../infrastructure/life-balance.repository';

export interface SaveLifeBalanceResult {
  id: string;
}

export async function saveLifeBalanceCommand(
  userId: string,
  data: LifeBalanceInput,
): Promise<SaveLifeBalanceResult> {
  const record = await lifeBalanceRepository.upsert(userId, data);
  return { id: record.id };
}
