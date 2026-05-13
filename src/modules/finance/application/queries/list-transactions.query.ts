import { transactionRepository } from '../../infrastructure/transaction.repository';
import type { TransactionFilters } from '../../domain/entities';

export async function listTransactionsQuery(userId: string, filters: TransactionFilters = {}) {
  return transactionRepository.findByUserId(userId, filters);
}

export async function getMonthlySummaryQuery(userId: string, year: number, month: number) {
  return transactionRepository.monthlySummary(userId, year, month);
}

export async function getDailySummaryQuery(userId: string, ymd: string) {
  return transactionRepository.dailySummary(userId, ymd);
}

export async function getYearlySummaryQuery(userId: string, year: number) {
  return transactionRepository.yearlySummary(userId, year);
}

export async function getBalanceAllTimeQuery(userId: string) {
  return transactionRepository.balanceAllTime(userId);
}

export async function getMonthlySeriesQuery(userId: string, months = 6) {
  return transactionRepository.monthlySeries(userId, months);
}

export async function getByCategoryQuery(userId: string, year: number, month: number) {
  return transactionRepository.byCategory(userId, year, month);
}

export async function getByCategoryForRangeQuery(userId: string, gte: Date, lt: Date) {
  return transactionRepository.byCategoryForRange(userId, gte, lt);
}
