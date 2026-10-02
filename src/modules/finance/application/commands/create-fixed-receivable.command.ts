import type { FixedReceivableInput } from '@/lib/validators/fixed-receivable';
import { fixedReceivableRepository } from '../../infrastructure/fixed-receivable.repository';

export async function createFixedReceivableCommand(userId: string, data: FixedReceivableInput) {
  const item = await fixedReceivableRepository.create(userId, data);
  return { item };
}
