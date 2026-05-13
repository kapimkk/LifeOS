import { resourceRepository } from '../../infrastructure/resource.repository';

export async function deleteResourceCommand(userId: string, id: string): Promise<void> {
  await resourceRepository.remove(userId, id);
}
