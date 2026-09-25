import { receivableRepository } from '../../infrastructure/receivable.repository';

export async function deleteReceivableCommand(userId: string, id: string) {
  await receivableRepository.remove(userId, id);
}
