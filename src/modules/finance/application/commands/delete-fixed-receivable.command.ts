import { fixedReceivableRepository } from '../../infrastructure/fixed-receivable.repository';

export async function deleteFixedReceivableCommand(userId: string, id: string) {
  await fixedReceivableRepository.remove(userId, id);
}
