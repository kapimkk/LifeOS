import type { Metadata } from 'next';
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { TransactionsClient } from './transactions-client';
import { InvestmentsSection } from './investments-section';
import { requireUser } from '@/server/auth/session';
import { categoriesService } from '@/server/services/categories';
import { investmentsService } from '@/server/services/investments';
import { transactionsService } from '@/server/services/transactions';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Finanças' };
export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const user = await requireUser();
  const now = new Date();

  const [
    monthly,
    allTime,
    monthlySeries,
    byCategory,
    categories,
    transactions,
    investments,
    investmentStats,
  ] = await Promise.all([
    transactionsService.monthlySummary(user.id, now.getFullYear(), now.getMonth()),
    transactionsService.balanceAllTime(user.id),
    transactionsService.monthlySeries(user.id, 6),
    transactionsService.byCategory(user.id, now.getFullYear(), now.getMonth()),
    categoriesService.list(user.id),
    transactionsService.list(user.id),
    investmentsService.list(user.id),
    investmentsService.stats(user.id),
  ]);

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    type: c.type,
    icon: c.icon,
  }));

  const serializedTransactions = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    description: t.description,
    notes: t.notes,
    categoryId: t.categoryId,
    date: t.date.toISOString(),
    recurrence: t.recurrence,
    category: t.category
      ? { id: t.category.id, name: t.category.name, color: t.category.color }
      : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanças"
        description="Acompanhe seu fluxo de caixa, organize categorias e visualize seu progresso."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Saldo do mês"
          value={formatCurrency(monthly.balance, user.currency)}
          icon={<Wallet />}
          accent={monthly.balance >= 0 ? 'success' : 'destructive'}
        />
        <StatCard
          label="Receitas do mês"
          value={formatCurrency(monthly.income, user.currency)}
          icon={<ArrowUpCircle />}
          accent="success"
        />
        <StatCard
          label="Despesas do mês"
          value={formatCurrency(monthly.expense, user.currency)}
          icon={<ArrowDownCircle />}
          accent="destructive"
        />
        <StatCard
          label="Investimentos"
          value={formatCurrency(investmentStats.total, user.currency)}
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

      <InvestmentsSection initialInvestments={investments} currency={user.currency} />

      <TransactionsClient
        initialTransactions={serializedTransactions}
        categories={serializedCategories}
        currency={user.currency}
      />

      {/* Indicador adicional para o saldo geral (incluindo balanço total) */}
      <p className="text-xs text-muted-foreground">
        Saldo total acumulado:{' '}
        <span className="font-medium text-foreground">
          {formatCurrency(allTime.balance, user.currency)}
        </span>
      </p>
    </div>
  );
}
