import type { TransactionInput } from '@/lib/validators/transaction';
import { transactionRepository } from '../../infrastructure/transaction.repository';

export interface CreateTransactionResult {
  ids: string[];
}

export async function createTransactionCommand(
  userId: string,
  data: TransactionInput,
): Promise<CreateTransactionResult> {
  const { rows } = await transactionRepository.createFromInput(userId, data);
  return { ids: rows.map((r) => r.id) };
}
