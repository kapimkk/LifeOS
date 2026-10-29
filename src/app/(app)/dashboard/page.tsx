import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarClock, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
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
  getFixedExpenseGroupTotalsQuery,
  getFixedExpensePendingTotalsQuery,
} from '@/modules/finance/application/queries/list-fixed-expenses.query';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();

  const [journeyRows, investments, investmentStats, expenseTotals, expensePending] =
    await Promise.all([
      listJourneysQuery(user.id),
      listInvestmentsQuery(user.id),
      getInvestmentStatsQuery(user.id),
      getFixedExpenseGroupTotalsQuery(user.id),
      getFixedExpensePendingTotalsQuery(user.id),
    ]);

  const fixedTotal = expenseTotals.PLANOS + expenseTotals.INVESTIMENTOS + expenseTotals.GERAL;
  const fixedPending = expensePending.PLANOS + expensePending.INVESTIMENTOS + expensePending.GERAL;

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user.name.split(' ')[0]}`}
        description="Resumo da jornada, dos gastos fixos e do patrimônio investido."
        actions={
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/financas/gastos-fixos">
              Ver gastos fixos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Gastos fixos no mês"
          value={formatCurrency(fixedTotal, user.currency)}
          icon={<CalendarClock />}
          accent="info"
        />
        <StatCard
          label="Ainda falta pagar"
          value={formatCurrency(fixedPending, user.currency)}
          icon={<Wallet />}
          accent={fixedPending > 0 ? 'destructive' : 'success'}
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
