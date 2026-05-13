import { investmentRepository } from '../../infrastructure/investment.repository';

export async function listInvestmentsQuery(userId: string) {
  return investmentRepository.findByUserId(userId);
}

export async function getInvestmentStatsQuery(userId: string) {
  return investmentRepository.stats(userId);
}
