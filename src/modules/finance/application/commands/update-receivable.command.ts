import type { ReceivableInput } from '@/lib/validators/receivable';
import { receivableRepository } from '../../infrastructure/receivable.repository';

export async function updateReceivableCommand(
  userId: string,
  id: string,
  data: Partial<ReceivableInput>,
) {
  const item = await receivableRepository.update(userId, id, data);
  return { item };
}
