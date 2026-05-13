import type { CategoryInput } from '@/lib/validators/transaction';
import { categoryRepository } from '../../infrastructure/category.repository';

export interface CategoryCommandResult {
  id: string;
}

export async function createCategoryCommand(
  userId: string,
  data: CategoryInput,
): Promise<CategoryCommandResult> {
  const cat = await categoryRepository.create(userId, data);
  return { id: cat.id };
}

export async function updateCategoryCommand(
  userId: string,
  id: string,
  data: Partial<CategoryInput>,
): Promise<CategoryCommandResult> {
  const cat = await categoryRepository.update(userId, id, data);
  return { id: cat.id };
}

export async function deleteCategoryCommand(userId: string, id: string): Promise<void> {
  await categoryRepository.remove(userId, id);
}
