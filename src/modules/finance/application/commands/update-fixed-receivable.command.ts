import type { FixedReceivableInput } from '@/lib/validators/fixed-receivable';
import { fixedReceivableRepository } from '../../infrastructure/fixed-receivable.repository';

export async function updateFixedReceivableCommand(
  userId: string,
  id: string,
  data: Partial<FixedReceivableInput>,
) {
  const item = await fixedReceivableRepository.update(userId, id, data);
  return { item };
}
