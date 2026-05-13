import type { TransactionInput } from '@/lib/validators/transaction';
import { transactionRepository } from '../../infrastructure/transaction.repository';

export interface UpdateTransactionResult {
  id: string;
}

export async function updateTransactionCommand(
  userId: string,
  id: string,
  data: Partial<TransactionInput>,
): Promise<UpdateTransactionResult> {
  const tx = await transactionRepository.update(userId, id, data);
  return { id: tx.id };
}
