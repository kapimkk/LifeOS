import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { listJourneysQuery } from '@/modules/journey/application/queries/list-journeys.query';
import { serializeJourney } from '@/modules/journey/interfaces/serialize-journey';
import { computeEarnedXp, computeTotalXpAvailable } from '@/modules/journey/domain/xp-progress';
import {
  getInvestmentStatsQuery,
  listInvestmentsQuery,
} from '@/modules/finance/application/queries/list-investments.query';

export async function GET() {
  try {
    const user = await requireUser();

    const [journeyRows, investments, investmentStats] = await Promise.all([
      listJourneysQuery(user.id),
      listInvestmentsQuery(user.id),
      getInvestmentStatsQuery(user.id),
    ]);

    const journeys = journeyRows.map((j) => {
      const serialized = serializeJourney({
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
      });
      const steps = [...serialized.steps].sort((a, b) => a.order - b.order);
      return {
        ...serialized,
        earnedXp: computeEarnedXp(steps),
        totalXp: computeTotalXpAvailable(steps),
        completedSteps: steps.filter((s) => s.status === 'COMPLETED').length,
        totalSteps: steps.length,
      };
    });

    return ok({
      journey: { list: journeys },
      investments: { list: investments, stats: investmentStats },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
