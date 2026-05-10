import type { Metadata } from 'next';
import { Activity, CheckCircle2, Flame } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { HabitsClient } from './habits-client';
import { requireUser } from '@/server/auth/session';
import { habitsService } from '@/server/services/habits';

export const metadata: Metadata = { title: 'Hábitos' };
export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const user = await requireUser();
  const [habits, todaySummary] = await Promise.all([
    habitsService.listWithStats(user.id, user.timezone),
    habitsService.todaySummary(user.id, user.timezone),
  ]);

  const longestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
  const avgConsistency =
    habits.length === 0
      ? 0
      : Math.round(habits.reduce((acc, h) => acc + h.consistency30d, 0) / habits.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hábitos"
        description="Pequenas ações diárias geram grandes evoluções. Construa sua rotina."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Concluídos hoje"
          value={`${todaySummary.done}/${todaySummary.active}`}
          icon={<CheckCircle2 />}
          accent="success"
        />
        <StatCard
          label="Maior sequência"
          value={`${longestStreak} dias`}
          icon={<Flame />}
          accent="warning"
        />
        <StatCard
          label="Consistência (30d)"
          value={`${avgConsistency}%`}
          icon={<Activity />}
          accent="info"
        />
      </div>

      <HabitsClient initialHabits={habits} />
    </div>
  );
}
