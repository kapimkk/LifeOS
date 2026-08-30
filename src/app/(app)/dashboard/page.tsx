import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDownCircle, ArrowRight, ArrowUpCircle, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart';
import { DashboardJourneySummary } from '@/components/dashboard/dashboard-journey-summary';
import { DashboardInvestmentsSummary } from '@/components/dashboard/dashboard-investments-summary';
import { requireUser } from '@/shared/auth/session';
import { listJourneysQuery } from '@/modules/journey/application/queries/list-journeys.query';
import { serializeJourney } from '@/modules/journey/interfaces/serialize-journey';
import {
  listInvestmentsQuery,
  getInvestmentStatsQuery,
} from '@/modules/finance/application/queries/list-investments.query';
import {
  getMonthlySeriesQuery,
  getMonthlySummaryQuery,
} from '@/modules/finance/application/queries/list-transactions.query';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();

  const [journeyRows, investments, investmentStats, monthSummary, monthlySeries] =
    await Promise.all([
      listJourneysQuery(user.id),
      listInvestmentsQuery(user.id),
      getInvestmentStatsQuery(user.id),
      getMonthlySummaryQuery(user.id, now.getFullYear(), now.getMonth()),
      getMonthlySeriesQuery(user.id, 6),
    ]);

  const journeys = journeyRows.map((j) =>
    serializeJourney({
      id: j.id,
      userId: j.userId,
      name: j.name,
      description: j.description,
      createdAt: j.createdAt,
      steps: j.steps.map((s) => ({
        id: s.id,
        journeyId: s.journeyId,
        title: s.title,
        description: s.description,
        url: s.url,
        instructor: s.instructor,
        difficulty: s.difficulty,
        xpReward: s.xpReward,
        order: s.order,
        status: s.status as 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED',
      })),
    }),
  );

  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user.name.split(' ')[0]}`}
        description="Resumo das suas finanças, jornada de estudos e patrimônio investido."
        actions={
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/financas/lancamentos">
              Ver finanças completas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Saldo em conta · ${monthLabel}`}
          value={formatCurrency(monthSummary.balanceCash, user.currency)}
          icon={<Wallet />}
          accent={monthSummary.balanceCash >= 0 ? 'success' : 'destructive'}
        />
        <StatCard
          label="Receitas no mês"
          value={formatCurrency(monthSummary.income, user.currency)}
          icon={<ArrowUpCircle />}
          accent="success"
        />
        <StatCard
          label="Despesas no mês"
          value={formatCurrency(monthSummary.expenseTotal, user.currency)}
          icon={<ArrowDownCircle />}
          accent="destructive"
        />
        <StatCard
          label="Patrimônio investido"
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

      <IncomeExpenseChart data={monthlySeries} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardJourneySummary journeys={journeys} />
        <DashboardInvestmentsSummary
          investments={investments}
          total={investmentStats.total}
          currency={user.currency}
          byType={investmentStats.byType}
        />
      </div>
    </div>
  );
}
