import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { DashboardJourneySummary } from '@/components/dashboard/dashboard-journey-summary';
import { DashboardInvestmentsSummary } from '@/components/dashboard/dashboard-investments-summary';
import { requireUser } from '@/shared/auth/session';
import { listJourneysQuery } from '@/modules/journey/application/queries/list-journeys.query';
import { serializeJourney } from '@/modules/journey/interfaces/serialize-journey';
import { listInvestmentsQuery } from '@/modules/finance/application/queries/list-investments.query';
import { getInvestmentStatsQuery } from '@/modules/finance/application/queries/list-investments.query';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();

  const [journeyRows, investments, investmentStats] = await Promise.all([
    listJourneysQuery(user.id),
    listInvestmentsQuery(user.id),
    getInvestmentStatsQuery(user.id),
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user.name.split(' ')[0]}`}
        description="Resumo da sua jornada de estudos e do seu patrimônio investido."
      />

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
