import { transactionRepository } from '../../infrastructure/transaction.repository';

export async function deleteTransactionCommand(userId: string, id: string): Promise<void> {
  await transactionRepository.remove(userId, id);
}
