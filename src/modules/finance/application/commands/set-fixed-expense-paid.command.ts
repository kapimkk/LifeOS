import { fixedExpenseRepository } from '../../infrastructure/fixed-expense.repository';

export async function setFixedExpensePaidCommand(userId: string, id: string, paid: boolean) {
  const item = await fixedExpenseRepository.setPaid(userId, id, paid);
  return { item };
}

export async function clearFixedExpensesPaidCommand(userId: string) {
  const count = await fixedExpenseRepository.clearPaid(userId);
  return { count };
}
