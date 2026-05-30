import { handleApiError, ok } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/shared/auth/session';
import { getGoalStatsQuery } from '@/modules/goals/application/queries/list-goals.query';
import {
  getHabitsTodaySummaryQuery,
  listHabitsWithStatsQuery,
} from '@/modules/habits/application/queries/list-habits.query';
import {
  getMonthlySummaryQuery,
  getBalanceAllTimeQuery,
  getMonthlySeriesQuery,
  getByCategoryQuery,
} from '@/modules/finance/application/queries/list-transactions.query';

export async function GET() {
  try {
    const user = await requireUser();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const [
      monthly,
      allTime,
      monthlySeries,
      byCategory,
      goalStats,
      activeGoals,
      habitsToday,
      habits,
    ] = await Promise.all([
      getMonthlySummaryQuery(user.id, year, month),
      getBalanceAllTimeQuery(user.id),
      getMonthlySeriesQuery(user.id, 6),
      getByCategoryQuery(user.id, year, month),
      getGoalStatsQuery(user.id),
      prisma.goal.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
        orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
        take: 4,
      }),
      getHabitsTodaySummaryQuery(user.id, user.timezone ?? 'UTC'),
      listHabitsWithStatsQuery(user.id, user.timezone ?? 'UTC'),
    ]);

    return ok({
      finance: { monthly, allTime, monthlySeries, byCategory },
      goals: { stats: goalStats, top: activeGoals },
      habits: { today: habitsToday, list: habits.slice(0, 6) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
