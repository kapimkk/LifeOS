import { receivableRepository } from '../../infrastructure/receivable.repository';

export async function listReceivablesQuery(userId: string) {
  return receivableRepository.findByUserId(userId);
}

export async function getReceivablesTotalQuery(userId: string) {
  return receivableRepository.totalByUserId(userId);
}
