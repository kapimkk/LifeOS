'use client';

import { Suspense } from 'react';
import { ArrowDownCircle, ArrowUpCircle, CreditCard, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { DateFinanceFilter } from '@/components/shared/date-finance-filter';
import { TransactionsClient } from './transactions-client';
import { InvestmentsSection } from './investments-section';
import { formatCurrency } from '@/lib/utils';
import type { SerializedInvestment } from '@/modules/finance/domain/entities';

interface Summary {
  income: number;
  expenseCash: number;
  invoiceCreditCard: number;
  expenseTotal: number;
  balanceCash: number;
  balanceIncludingCard: number;
}

interface Props {
  periodHeadline: string;
  anchorDayIso: string;
  monthIdx: number;
  yearNum: number;
  summary: Summary;
  previousSummary?: Summary | null;
  allTimeCash: Summary;
  monthlySeries: { key: string; income: number; expense: number; label: string }[];
  byCategory: { categoryId: string | null; name: string; color: string; value: number }[];
  serializedCategories: Parameters<typeof TransactionsClient>[0]['categories'];
  serializedTransactions: Parameters<typeof TransactionsClient>[0]['initialTransactions'];
  currency: string;
  investments: SerializedInvestment[];
  investmentStats: { total: number; count: number; byType: Record<string, number> };
}

function expenseTrendPct(current: Summary, prev: Summary) {
  if (prev.expenseTotal <= 0) return 0;
  return Math.round(((current.expenseTotal - prev.expenseTotal) / prev.expenseTotal) * 100);
}

function incomeTrendPct(current: Summary, prev: Summary) {
  if (prev.income <= 0) return 0;
  return Math.round(((current.income - prev.income) / prev.income) * 100);
}

export function FinancePageShell({
  periodHeadline,
  anchorDayIso,
  monthIdx,
  yearNum,
  summary,
  previousSummary,
  allTimeCash,
  monthlySeries,
  byCategory,
  serializedCategories,
  serializedTransactions,
  currency,
  investments,
  investmentStats,
}: Props) {
  const expenseTrend =
    previousSummary !== null && previousSummary !== undefined
      ? expenseTrendPct(summary, previousSummary)
      : 0;
  const incomeTrend =
    previousSummary !== null && previousSummary !== undefined
      ? incomeTrendPct(summary, previousSummary)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Finanças — ${periodHeadline}`}
        description="Acompanhe seu fluxo em conta, fatura do cartão e parcelas futuras."
      />

      <Suspense fallback={<div className="h-28 animate-pulse rounded-lg bg-muted/40" />}>
        <DateFinanceFilter
          initialDay={anchorDayIso}
          initialMonth={monthIdx}
          initialYear={yearNum}
        />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Saldo em conta no período"
          value={formatCurrency(summary.balanceCash, currency)}
          icon={<Wallet />}
          accent={summary.balanceCash >= 0 ? 'success' : 'destructive'}
        />
        <StatCard
          label="Fatura cartão no período"
          value={formatCurrency(summary.invoiceCreditCard, currency)}
          icon={<CreditCard />}
          accent="warning"
        />
        <StatCard
          label="Receitas no período"
          value={formatCurrency(summary.income, currency)}
          icon={<ArrowUpCircle />}
          accent="success"
          trend={incomeTrend ? { value: incomeTrend, label: 'vs período anterior' } : undefined}
        />
        <StatCard
          label="Despesas (conta)"
          value={formatCurrency(summary.expenseCash, currency)}
          icon={<ArrowDownCircle />}
          accent="destructive"
          trend={expenseTrend ? { value: -expenseTrend, label: 'vs período anterior' } : undefined}
        />
        <StatCard
          label="Investimentos"
          value={formatCurrency(investmentStats.total, currency)}
          icon={<TrendingUp />}
          accent="info"
          trend={
            investmentStats.count > 0
              ? { value: investmentStats.count, label: 'caixinhas' }
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={monthlySeries} />
        </div>
        <CategoryChart data={byCategory} />
      </div>

      <InvestmentsSection initialInvestments={investments} currency={currency} />

      <TransactionsClient
        initialTransactions={serializedTransactions}
        categories={serializedCategories}
        currency={currency}
      />

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          Saldo histórico em conta (receitas − despesas fora da fatura de cartão):{' '}
          <span className="font-medium text-foreground">
            {formatCurrency(allTimeCash.balanceCash, currency)}
          </span>
        </p>
        <p>
          Resultado líquido completo incluindo faturas vencidas:{' '}
          <span className="font-medium text-foreground">
            {formatCurrency(allTimeCash.balanceIncludingCard, currency)}
          </span>
        </p>
      </div>
    </div>
  );
}
