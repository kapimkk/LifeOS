'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/fetcher';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date | string | null;
}

const priorityVariant: Record<Task['priority'], 'default' | 'success' | 'warning' | 'destructive'> = {
  LOW: 'success',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'destructive',
};

export function PendingTasks({ tasks: initial }: { tasks: Task[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initial);

  async function toggle(id: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiFetch(`/api/tasks/${id}/toggle`, { method: 'POST' });
      router.refresh();
    } catch {
      setTasks(previous);
      toast.error('Erro ao concluir tarefa');
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Tarefas pendentes</CardTitle>
            <CardDescription>{tasks.length} a fazer</CardDescription>
          </div>
          <Link href="/tarefas" className="text-xs font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nada pendente — bom trabalho!
          </p>
        ) : (
          <ul className="space-y-1">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent/50"
              >
                <Checkbox onCheckedChange={() => toggle(t.id)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  {t.dueDate && (
                    <p className="text-xs text-muted-foreground">para {formatDate(t.dueDate)}</p>
                  )}
                </div>
                <Badge variant={priorityVariant[t.priority]}>{t.priority.toLowerCase()}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
