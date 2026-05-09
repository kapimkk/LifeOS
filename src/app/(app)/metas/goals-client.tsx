'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoalDialog } from './goal-dialog';
import { apiFetch } from '@/lib/fetcher';
import { formatDate } from '@/lib/utils';

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

export function GoalsClient({ initialGoals }: { initialGoals: GoalItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialGoals);
  const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<GoalItem | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'ACTIVE')}>
          <TabsList>
            <TabsTrigger value="ACTIVE">Ativas</TabsTrigger>
            <TabsTrigger value="COMPLETED">Concluídas</TabsTrigger>
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
            Nenhuma meta nesta categoria. Crie a primeira para começar a evoluir.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {filtered.map((g) => (
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
                <Card className="group h-full transition-colors hover:border-primary/40">
                  <CardContent className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{g.title}</p>
                        {g.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {g.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(g.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{categoryLabel[g.category]}</Badge>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${priorityColor[g.priority]}`}
                      >
                        {g.priority.toLowerCase()}
                      </span>
                      {g.deadline && (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(g.deadline)}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-auto space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{g.progress}%</span>
                      </div>
                      <Progress value={g.progress} className="h-2" />
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
            ))}
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
