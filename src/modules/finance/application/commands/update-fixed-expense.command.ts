import type { FixedExpenseInput } from '@/lib/validators/fixed-expense';
import { fixedExpenseRepository } from '../../infrastructure/fixed-expense.repository';

export async function updateFixedExpenseCommand(
  userId: string,
  id: string,
  data: Partial<FixedExpenseInput>,
) {
  const item = await fixedExpenseRepository.update(userId, id, data);
  return { item };
}
