import type { InvestmentInput } from '@/lib/validators/investment';
import { investmentRepository } from '../../infrastructure/investment.repository';
import type { SerializedInvestment } from '../../domain/entities';

export interface InvestmentCommandResult {
  id: string;
}

export async function createInvestmentCommand(
  userId: string,
  data: InvestmentInput,
): Promise<InvestmentCommandResult> {
  const inv = await investmentRepository.create(userId, data);
  return { id: inv.id };
}

export async function updateInvestmentCommand(
  userId: string,
  id: string,
  data: Partial<InvestmentInput>,
): Promise<InvestmentCommandResult> {
  const inv = await investmentRepository.update(userId, id, data);
  return { id: inv.id };
}

export async function deleteInvestmentCommand(userId: string, id: string): Promise<void> {
  await investmentRepository.remove(userId, id);
}

export async function getInvestmentById(
  userId: string,
  id: string,
): Promise<SerializedInvestment | undefined> {
  const all = await investmentRepository.findByUserId(userId);
  return all.find((i) => i.id === id);
}
