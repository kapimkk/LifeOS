'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskDialog } from './task-dialog';
import { apiFetch } from '@/lib/fetcher';
import { cn, formatDate } from '@/lib/utils';

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string | null;
}

const priorityVariant: Record<TaskItem['priority'], 'default' | 'success' | 'warning' | 'destructive'> = {
  LOW: 'success',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'destructive',
};

const priorityLabel: Record<TaskItem['priority'], string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export function TasksClient({ initialTasks }: { initialTasks: TaskItem[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [tab, setTab] = useState<'OPEN' | 'DONE' | 'ALL'>('OPEN');
  const [openDialog, setOpenDialog] = useState(false);

  const filtered = useMemo(() => {
    if (tab === 'OPEN') return tasks.filter((t) => t.status !== 'DONE' && t.status !== 'ARCHIVED');
    if (tab === 'DONE') return tasks.filter((t) => t.status === 'DONE');
    return tasks;
  }, [tasks, tab]);

  const groups = useMemo(() => {
    return {
      urgent: filtered.filter((t) => t.priority === 'URGENT' && t.status !== 'DONE'),
      today: filtered.filter(
        (t) =>
          t.priority !== 'URGENT' &&
          t.dueDate &&
          new Date(t.dueDate).toDateString() === new Date().toDateString() &&
          t.status !== 'DONE',
      ),
      others: filtered.filter(
        (t) =>
          t.priority !== 'URGENT' &&
          (!t.dueDate || new Date(t.dueDate).toDateString() !== new Date().toDateString()) &&
          t.status !== 'DONE',
      ),
      done: filtered.filter((t) => t.status === 'DONE'),
    };
  }, [filtered]);

  async function toggle(id: string) {
    const prev = tasks;
    setTasks((arr) =>
      arr.map((t) =>
        t.id === id ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' } : t,
      ),
    );
    try {
      await apiFetch(`/api/tasks/${id}/toggle`, { method: 'POST' });
      router.refresh();
    } catch {
      setTasks(prev);
      toast.error('Erro ao atualizar tarefa');
    }
  }

  async function remove(id: string) {
    const prev = tasks;
    setTasks((arr) => arr.filter((t) => t.id !== id));
    try {
      await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
      toast.success('Tarefa removida');
      router.refresh();
    } catch {
      setTasks(prev);
      toast.error('Erro ao remover');
    }
  }

  function handleCreated(item: TaskItem) {
    setTasks((arr) => [item, ...arr]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'OPEN')}>
          <TabsList>
            <TabsTrigger value="OPEN">Abertas</TabsTrigger>
            <TabsTrigger value="DONE">Concluídas</TabsTrigger>
            <TabsTrigger value="ALL">Todas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Nenhuma tarefa por aqui.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <TaskGroup
            title="Urgente"
            count={groups.urgent.length}
            tasks={groups.urgent}
            onToggle={toggle}
            onRemove={remove}
          />
          <TaskGroup
            title="Para hoje"
            count={groups.today.length}
            tasks={groups.today}
            onToggle={toggle}
            onRemove={remove}
          />
          <TaskGroup
            title="Próximas"
            count={groups.others.length}
            tasks={groups.others}
            onToggle={toggle}
            onRemove={remove}
          />
          {tab !== 'OPEN' && groups.done.length > 0 && (
            <TaskGroup
              title="Concluídas"
              count={groups.done.length}
              tasks={groups.done}
              onToggle={toggle}
              onRemove={remove}
            />
          )}
        </div>
      )}

      <TaskDialog open={openDialog} onOpenChange={setOpenDialog} onCreated={handleCreated} />
    </div>
  );

  function TaskGroup({
    title,
    count,
    tasks,
    onToggle,
    onRemove,
  }: {
    title: string;
    count: number;
    tasks: TaskItem[];
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
  }) {
    if (count === 0) return null;
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            {title}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {count}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60">
            <AnimatePresence initial={false}>
              {tasks.map((t) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-start gap-3 py-3"
                >
                  <Checkbox
                    checked={t.status === 'DONE'}
                    onCheckedChange={() => onToggle(t.id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        t.status === 'DONE' && 'text-muted-foreground line-through',
                      )}
                    >
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                    )}
                    {t.dueDate && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {formatDate(t.dueDate)}
                      </p>
                    )}
                  </div>
                  <Badge variant={priorityVariant[t.priority]}>{priorityLabel[t.priority]}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onRemove(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </CardContent>
      </Card>
    );
  }
}
