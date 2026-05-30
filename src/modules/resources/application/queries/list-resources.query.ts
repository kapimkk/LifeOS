import { resourceRepository } from '../../infrastructure/resource.repository';
import type { ResourceVaultCategory } from '../../domain/entities';

export async function listResourcesQuery(userId: string, vaultCategory?: ResourceVaultCategory) {
  return resourceRepository.findByUserId(userId, vaultCategory);
}
