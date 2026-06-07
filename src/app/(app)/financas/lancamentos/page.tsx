import type { Metadata } from 'next';
import { requireUser } from '@/shared/auth/session';
import { listCategoriesQuery } from '@/modules/finance/application/queries/list-categories.query';
import {
  listInvestmentsQuery,
  getInvestmentStatsQuery,
} from '@/modules/finance/application/queries/list-investments.query';
import {
  getMonthlySummaryQuery,
  getBalanceAllTimeQuery,
  getMonthlySeriesQuery,
  getByCategoryForRangeQuery,
  listTransactionsQuery,
  getDailySummaryQuery,
  getYearlySummaryQuery,
} from '@/modules/finance/application/queries/list-transactions.query';
import { serializeTransaction } from '@/modules/finance/interfaces/serialize-transaction';
import { FinancePageShell } from '../finance-page-shell';
import { resolveFinancePeriod } from '../finance-period';

export const metadata: Metadata = { title: 'Lançamentos' };
export const dynamic = 'force-dynamic';

interface SearchParamsMaybe {
  view?: string;
  d?: string;
  m?: string;
  y?: string;
}

export default async function FinanceLancamentosPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsMaybe> | SearchParamsMaybe;
}) {
  const user = await requireUser();

  const spRaw = searchParams instanceof Promise ? await searchParams : searchParams;
  const period = resolveFinancePeriod(spRaw ?? {});

  async function summaryForResolved() {
    if (period.view === 'day') return getDailySummaryQuery(user.id, period.listFilters.day!);
    if (period.view === 'month') return getMonthlySummaryQuery(user.id, period.year, period.month);
    return getYearlySummaryQuery(user.id, period.year);
  }

  async function previousSummary() {
    if (period.previousPeriod.kind === 'day') {
      return getDailySummaryQuery(user.id, String(period.previousPeriod.ymd));
    }
    if (period.previousPeriod.kind === 'month') {
      return getMonthlySummaryQuery(
        user.id,
        period.previousPeriod.py as number,
        period.previousPeriod.pm as number,
      );
    }
    return getYearlySummaryQuery(user.id, period.previousPeriod.py as number);
  }

  const [
    summary,
    prevSummary,
    allTimeCash,
    monthlySeries,
    byCategory,
    categories,
    transactions,
    investments,
    investmentStats,
  ] = await Promise.all([
    summaryForResolved(),
    previousSummary(),
    getBalanceAllTimeQuery(user.id),
    getMonthlySeriesQuery(user.id, 6),
    getByCategoryForRangeQuery(user.id, period.categoryGte, period.categoryLt),
    listCategoriesQuery(user.id),
    listTransactionsQuery(user.id, period.listFilters),
    listInvestmentsQuery(user.id),
    getInvestmentStatsQuery(user.id),
  ]);

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    type: c.type as 'INCOME' | 'EXPENSE',
    icon: c.icon,
  }));

  const serializedTransactions = transactions.map(serializeTransaction);

  return (
    <FinancePageShell
      periodHeadline={period.headline}
      anchorDayIso={period.anchorDayStr}
      monthIdx={period.month}
      yearNum={period.year}
      summary={summary}
      previousSummary={prevSummary}
      allTimeCash={allTimeCash}
      monthlySeries={monthlySeries}
      byCategory={byCategory}
      serializedCategories={serializedCategories}
      serializedTransactions={serializedTransactions}
      currency={user.currency}
      investments={investments}
      investmentStats={investmentStats}
    />
  );
}
