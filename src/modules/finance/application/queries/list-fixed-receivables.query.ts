import { fixedReceivableRepository } from '../../infrastructure/fixed-receivable.repository';

export async function listFixedReceivablesQuery(userId: string) {
  return fixedReceivableRepository.findByUserId(userId);
}
