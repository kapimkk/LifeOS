import type { FixedExpenseGroup } from '@/lib/validators/fixed-expense';
import { fixedExpenseRepository } from '../../infrastructure/fixed-expense.repository';

export async function listFixedExpensesQuery(userId: string, group: FixedExpenseGroup) {
  return fixedExpenseRepository.findByUserId(userId, group);
}

export async function getFixedExpensesTotalQuery(userId: string, group: FixedExpenseGroup) {
  return fixedExpenseRepository.totalByUserId(userId, group);
}

export async function getFixedExpenseGroupTotalsQuery(userId: string) {
  return fixedExpenseRepository.totalsByUserId(userId);
}

export async function getFixedExpensePendingTotalsQuery(userId: string) {
  return fixedExpenseRepository.pendingTotalsByUserId(userId);
}
