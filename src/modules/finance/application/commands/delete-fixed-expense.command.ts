import { fixedExpenseRepository } from '../../infrastructure/fixed-expense.repository';

export async function deleteFixedExpenseCommand(userId: string, id: string) {
  await fixedExpenseRepository.remove(userId, id);
  return { id };
}
