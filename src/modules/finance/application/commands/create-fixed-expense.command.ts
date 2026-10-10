import type { FixedExpenseGroup, FixedExpenseInput } from '@/lib/validators/fixed-expense';
import { fixedExpenseRepository } from '../../infrastructure/fixed-expense.repository';

export async function createFixedExpenseCommand(
  userId: string,
  data: FixedExpenseInput,
  group: FixedExpenseGroup,
) {
  const item = await fixedExpenseRepository.create(userId, data, group);
  return { id: item.id, item };
}
