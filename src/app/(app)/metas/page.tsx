import type { Metadata } from 'next';
import { Award, Target, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { GoalsClient } from './goals-client';
import { requireUser } from '@/shared/auth/session';
import {
  listGoalsQuery,
  getGoalStatsQuery,
} from '@/modules/goals/application/queries/list-goals.query';

export const metadata: Metadata = { title: 'Metas' };
export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const user = await requireUser();
  const [goals, stats] = await Promise.all([listGoalsQuery(user.id), getGoalStatsQuery(user.id)]);

  const serialized = goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    category: g.category,
    targetValue: g.targetValue ? Number(g.targetValue) : null,
    currentValue: Number(g.currentValue),
    progress: g.progress,
    priority: g.priority,
    status: g.status,
    deadline: g.deadline?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas"
        description="Defina e acompanhe seus objetivos pessoais, financeiros e de carreira."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Metas ativas"
          value={String(stats.active)}
          icon={<Target />}
          accent="info"
        />
        <StatCard
          label="Concluídas"
          value={String(stats.completed)}
          icon={<Award />}
          accent="success"
        />
        <StatCard
          label="Progresso médio"
          value={`${stats.avgProgress}%`}
          icon={<TrendingUp />}
          accent="primary"
        />
      </div>

      <GoalsClient initialGoals={serialized} />
    </div>
  );
}
