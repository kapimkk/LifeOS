import type { FixedExpenseInput } from '@/lib/validators/fixed-expense';
import { fixedExpenseRepository } from '../../infrastructure/fixed-expense.repository';

export async function createFixedExpenseCommand(userId: string, data: FixedExpenseInput) {
  const item = await fixedExpenseRepository.create(userId, data);
  return { id: item.id, item };
}
