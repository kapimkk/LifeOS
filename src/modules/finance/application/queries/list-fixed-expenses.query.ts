import { fixedExpenseRepository } from '../../infrastructure/fixed-expense.repository';

export async function listFixedExpensesQuery(userId: string) {
  return fixedExpenseRepository.findByUserId(userId);
}

export async function getFixedExpensesTotalQuery(userId: string) {
  return fixedExpenseRepository.totalByUserId(userId);
}
