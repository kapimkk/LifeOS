import { resourceRepository } from '../../infrastructure/resource.repository';

export async function listResourcesQuery(userId: string) {
  return resourceRepository.findByUserId(userId);
}

export async function listResourceCategoriesQuery(userId: string) {
  return resourceRepository.categories(userId);
}
