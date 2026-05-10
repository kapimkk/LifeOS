'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Loader2, Plus, RotateCcw, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoalDialog } from './goal-dialog';
import { apiFetch } from '@/lib/fetcher';
import { cn, formatDate } from '@/lib/utils';

export interface GoalItem {
  id: string;
  title: string;
  description?: string | null;
  category: 'FINANCIAL' | 'PERSONAL' | 'STUDIES' | 'FITNESS' | 'CAREER' | 'OTHER';
  targetValue?: number | null;
  currentValue: number;
  progress: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
  deadline?: string | null;
}

const categoryLabel: Record<GoalItem['category'], string> = {
  FINANCIAL: 'Financeira',
  PERSONAL: 'Pessoal',
  STUDIES: 'Estudos',
  FITNESS: 'Fitness',
  CAREER: 'Carreira',
  OTHER: 'Outros',
};

const priorityColor: Record<GoalItem['priority'], string> = {
  LOW: 'bg-success/15 text-success',
  MEDIUM: 'bg-info/15 text-info',
  HIGH: 'bg-warning/15 text-warning',
  URGENT: 'bg-destructive/15 text-destructive',
};

type Tab = 'ACTIVE' | 'COMPLETED' | 'ALL';

export function GoalsClient({ initialGoals }: { initialGoals: GoalItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialGoals);
  const [tab, setTab] = useState<Tab>('ACTIVE');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<GoalItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = tab === 'ALL' ? items : items.filter((g) => g.status === tab);

  async function handleDelete(id: string) {
    const previous = items;
    setItems((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiFetch(`/api/goals/${id}`, { method: 'DELETE' });
      toast.success('Meta removida');
      router.refresh();
    } catch {
      setItems(previous);
      toast.error('Erro ao remover meta');
    }
  }

  function handleToggleComplete(id: string, currentStatus: GoalItem['status']) {
    const newStatus: GoalItem['status'] = currentStatus === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED';
    const previous = items;

    // Optimistic update
    setItems((prev) => prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g)));
    setPendingId(id);

    startTransition(async () => {
      try {
        await apiFetch(`/api/goals/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
        if (newStatus === 'COMPLETED') {
          toast.success('🎉 Meta concluída! Parabéns!');
        } else {
          toast.success('Meta reativada');
        }
        router.refresh();
      } catch {
        setItems(previous);
        toast.error('Erro ao atualizar meta');
      } finally {
        setPendingId(null);
      }
    });
  }

  function handleSaved(item: GoalItem) {
    setItems((prev) => {
      const idx = prev.findIndex((t) => t.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    router.refresh();
  }

  const activeCount = items.filter((g) => g.status === 'ACTIVE').length;
  const completedCount = items.filter((g) => g.status === 'COMPLETED').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="ACTIVE">
              Ativas
              {activeCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 text-[10px] font-semibold text-primary">
                  {activeCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="COMPLETED">
              Concluídas
              {completedCount > 0 && (
                <span className="ml-1.5 rounded-full bg-success/20 px-1.5 text-[10px] font-semibold text-success">
                  {completedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ALL">Todas</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpenDialog(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nova meta
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            {tab === 'ACTIVE' && 'Nenhuma meta ativa. Crie a primeira para começar a evoluir.'}
            {tab === 'COMPLETED' && 'Nenhuma meta concluída ainda. Continue firme!'}
            {tab === 'ALL' && 'Nenhuma meta cadastrada.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {filtered.map((g) => {
              const isCompleted = g.status === 'COMPLETED';
              const isThisPending = pendingId === g.id && isPending;

              return (
                <motion.div
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    setEditing(g);
                    setOpenDialog(true);
                  }}
                  className="cursor-pointer"
                >
                  <Card
                    className={cn(
                      'group h-full transition-colors hover:border-primary/40',
                      isCompleted && 'border-success/30 bg-success/5',
                    )}
                  >
                    <CardContent className="flex h-full flex-col gap-4 p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <Trophy className="h-4 w-4 shrink-0 text-success" />
                            )}
                            <p
                              className={cn(
                                'truncate font-medium',
                                isCompleted && 'text-muted-foreground line-through',
                              )}
                            >
                              {g.title}
                            </p>
                          </div>
                          {g.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {g.description}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div
                          className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Complete / Reactivate button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8',
                              isCompleted
                                ? 'text-success hover:text-foreground'
                                : 'hover:text-success',
                            )}
                            disabled={isThisPending}
                            onClick={() => handleToggleComplete(g.id, g.status)}
                            title={isCompleted ? 'Reativar meta' : 'Marcar como concluída'}
                          >
                            {isThisPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isCompleted ? (
                              <RotateCcw className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => handleDelete(g.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{categoryLabel[g.category]}</Badge>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                            priorityColor[g.priority],
                          )}
                        >
                          {g.priority.toLowerCase()}
                        </span>
                        {isCompleted && (
                          <Badge
                            variant="outline"
                            className="border-success/40 bg-success/10 text-success"
                          >
                            Concluída
                          </Badge>
                        )}
                        {g.deadline && (
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(g.deadline)}
                          </Badge>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="mt-auto space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{g.progress}%</span>
                        </div>
                        <Progress
                          value={g.progress}
                          className={cn('h-2', isCompleted && '[&>div]:bg-success')}
                        />
                        {g.targetValue && (
                          <p className="text-xs text-muted-foreground">
                            {g.currentValue.toLocaleString('pt-BR')} de{' '}
                            {g.targetValue.toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <GoalDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        onSaved={handleSaved}
      />
    </div>
  );
}
