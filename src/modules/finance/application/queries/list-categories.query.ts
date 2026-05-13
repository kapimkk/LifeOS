import { categoryRepository } from '../../infrastructure/category.repository';

export async function listCategoriesQuery(userId: string) {
  return categoryRepository.findByUserId(userId);
}
