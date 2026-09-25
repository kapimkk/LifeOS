import type { ReceivableInput } from '@/lib/validators/receivable';
import { receivableRepository } from '../../infrastructure/receivable.repository';

export async function createReceivableCommand(userId: string, data: ReceivableInput) {
  const item = await receivableRepository.create(userId, data);
  return { id: item.id, item };
}
