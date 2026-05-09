'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Flame, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitDialog } from './habit-dialog';
import { apiFetch } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

export interface HabitItem {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string;
  active: boolean;
  targetPerDay: number;
  streak: number;
  longestStreak: number;
  doneToday: boolean;
  consistency30d: number;
  last30: { date: string; done: boolean }[];
}

export function HabitsClient({ initialHabits }: { initialHabits: HabitItem[] }) {
  const router = useRouter();
  const [habits, setHabits] = useState(initialHabits);
  const [openDialog, setOpenDialog] = useState(false);

  async function toggle(id: string) {
    const prev = habits;
    setHabits((arr) =>
      arr.map((h) =>
        h.id === id
          ? {
              ...h,
              doneToday: !h.doneToday,
              streak: h.doneToday ? h.streak - 1 : h.streak + 1,
            }
          : h,
      ),
    );
    try {
      await apiFetch(`/api/habits/${id}/toggle`, { method: 'POST' });
      router.refresh();
    } catch {
      setHabits(prev);
      toast.error('Erro ao atualizar hábito');
    }
  }

  async function remove(id: string) {
    const prev = habits;
    setHabits((arr) => arr.filter((h) => h.id !== id));
    try {
      await apiFetch(`/api/habits/${id}`, { method: 'DELETE' });
      toast.success('Hábito removido');
      router.refresh();
    } catch {
      setHabits(prev);
      toast.error('Erro ao remover hábito');
    }
  }

  function handleCreated(item: HabitItem) {
    setHabits((arr) => [...arr, item]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4" /> Novo hábito
        </Button>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Crie seu primeiro hábito e comece a construir sua rotina.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {habits.map((h) => (
            <Card key={h.id} className="group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggle(h.id)}
                      aria-label="Marcar hoje"
                      className="relative"
                    >
                      <motion.div
                        whileTap={{ scale: 0.85 }}
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                          h.doneToday ? 'border-transparent text-white' : 'border-border',
                        )}
                        style={h.doneToday ? { backgroundColor: h.color } : undefined}
                      >
                        {h.doneToday && <Check className="h-5 w-5" strokeWidth={3} />}
                      </motion.div>
                    </button>
                    <div>
                      <p className="font-medium">{h.title}</p>
                      {h.description && (
                        <p className="text-xs text-muted-foreground">{h.description}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 text-warning">
                          <Flame className="h-3 w-3" /> {h.streak} dias
                        </span>
                        <span>Maior: {h.longestStreak}</span>
                        <span>Consistência: {h.consistency30d}%</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => remove(h.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Últimos 30 dias
                  </p>
                  <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
                    {h.last30.map((day) => (
                      <div
                        key={day.date}
                        title={day.date}
                        className={cn(
                          'h-3 w-full rounded-sm transition-colors',
                          day.done ? '' : 'bg-muted/40',
                        )}
                        style={day.done ? { backgroundColor: h.color } : undefined}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <HabitDialog open={openDialog} onOpenChange={setOpenDialog} onCreated={handleCreated} />
    </div>
  );
}
