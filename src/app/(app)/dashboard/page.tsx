import type { Metadata } from 'next';
import { CheckCircle2, Target, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { HabitsToday } from '@/components/dashboard/habits-today';
import { ActiveGoals } from '@/components/dashboard/active-goals';
import { PendingTasks } from '@/components/dashboard/pending-tasks';
import { MoodTracker } from '@/components/dashboard/mood-tracker';
import { MoodHeatmap } from '@/components/dashboard/mood-heatmap';
import { requireUser } from '@/server/auth/session';
import { goalsService } from '@/server/services/goals';
import { habitsService } from '@/server/services/habits';
import { tasksService } from '@/server/services/tasks';
import { transactionsService } from '@/server/services/transactions';
import { getTodayMood, getMoodHistory } from '@/server/actions/life-balance-actions';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const [monthly, monthlySeries, byCategory, goalStats, activeGoals, taskStats, pendingTasks, habitsToday, habits, todayMood, moodHistory] =
    await Promise.all([
      transactionsService.monthlySummary(user.id, year, month),
      transactionsService.monthlySeries(user.id, 6),
      transactionsService.byCategory(user.id, year, month),
      goalsService.stats(user.id),
      prisma.goal.findMany({
        where: { userId: user.id, status: 'ACTIVE' },
        orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
        take: 4,
      }),
      tasksService.stats(user.id),
      prisma.task.findMany({
        where: { userId: user.id, status: { not: 'DONE' } },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 5,
      }),
      habitsService.todaySummary(user.id),
      habitsService.listWithStats(user.id),
      getTodayMood(),
      getMoodHistory(365),
    ]);

  const previousMonth = await transactionsService.monthlySummary(
    user.id,
    month === 0 ? year - 1 : year,
    month === 0 ? 11 : month - 1,
  );

  const expenseTrend =
    previousMonth.expense > 0
      ? Math.round(((monthly.expense - previousMonth.expense) / previousMonth.expense) * 100)
      : 0;

  const incomeTrend =
    previousMonth.income > 0
      ? Math.round(((monthly.income - previousMonth.income) / previousMonth.income) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user.name.split(' ')[0]}`}
        description="Aqui está o resumo da sua semana e do seu mês."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Saldo do mês"
          value={formatCurrency(monthly.balance, user.currency)}
          icon={<Wallet />}
          accent={monthly.balance >= 0 ? 'success' : 'destructive'}
          delay={0}
        />
        <StatCard
          label="Receitas"
          value={formatCurrency(monthly.income, user.currency)}
          icon={<TrendingUp />}
          accent="success"
          trend={incomeTrend ? { value: incomeTrend, label: 'vs mês anterior' } : undefined}
          delay={0.05}
        />
        <StatCard
          label="Despesas"
          value={formatCurrency(monthly.expense, user.currency)}
          icon={<Wallet />}
          accent="destructive"
          trend={expenseTrend ? { value: -expenseTrend, label: 'vs mês anterior' } : undefined}
          delay={0.1}
        />
        <StatCard
          label="Metas ativas"
          value={`${goalStats.active}`}
          icon={<Target />}
          accent="info"
          trend={{ value: goalStats.avgProgress, label: 'progresso médio' }}
          delay={0.15}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={monthlySeries} />
        </div>
        <CategoryChart data={byCategory} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <HabitsToday
          habits={habits.map((h) => ({
            id: h.id,
            title: h.title,
            color: h.color,
            streak: h.streak,
            doneToday: h.doneToday,
          }))}
          summary={habitsToday}
        />
        <ActiveGoals
          goals={activeGoals.map((g) => ({
            id: g.id,
            title: g.title,
            category: g.category,
            progress: g.progress,
            priority: g.priority,
            deadline: g.deadline,
          }))}
        />
        <PendingTasks tasks={pendingTasks} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Tarefas concluídas"
          value={`${taskStats.done}`}
          icon={<CheckCircle2 />}
          accent="success"
        />
        <StatCard
          label="Hábitos hoje"
          value={`${habitsToday.done}/${habitsToday.active}`}
          icon={<Target />}
          accent="warning"
        />
        <StatCard
          label="Metas concluídas"
          value={`${goalStats.completed}`}
          icon={<Target />}
          accent="primary"
        />
      </div>

      {/* Diário de Humor */}
      <div className="grid gap-4 lg:grid-cols-3">
        <MoodTracker todayMood={todayMood} />
        <div className="lg:col-span-2">
          <MoodHeatmap logs={moodHistory} />
        </div>
      </div>
    </div>
  );
}
