import type { Metadata } from 'next';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { TasksClient } from './tasks-client';
import { requireUser } from '@/shared/auth/session';
import {
  listTasksQuery,
  getTaskStatsQuery,
} from '@/modules/tasks/application/queries/list-tasks.query';

export const metadata: Metadata = { title: 'Tarefas' };
export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const user = await requireUser();
  const [tasks, stats] = await Promise.all([listTasksQuery(user.id), getTaskStatsQuery(user.id)]);

  const serialized = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarefas"
        description="Organize sua semana. Foco em concluir, não só anotar."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="A fazer" value={String(stats.todo)} icon={<ListTodo />} accent="info" />
        <StatCard
          label="Em andamento"
          value={String(stats.inProgress)}
          icon={<Clock />}
          accent="warning"
        />
        <StatCard
          label="Concluídas"
          value={String(stats.done)}
          icon={<CheckCircle2 />}
          accent="success"
        />
      </div>

      <TasksClient initialTasks={serialized} />
    </div>
  );
}
