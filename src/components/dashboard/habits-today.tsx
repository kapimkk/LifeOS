'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiFetch } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

interface Habit {
  id: string;
  title: string;
  color: string;
  streak: number;
  doneToday: boolean;
}

export function HabitsToday({
  habits: initial,
  summary,
}: {
  habits: Habit[];
  summary: { active: number; done: number; percentage: number };
}) {
  const router = useRouter();
  const [habits, setHabits] = useState(initial);

  async function toggle(id: string) {
    const previous = habits;
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, doneToday: !h.doneToday, streak: h.doneToday ? h.streak - 1 : h.streak + 1 }
          : h,
      ),
    );
    try {
      await apiFetch(`/api/habits/${id}/toggle`, { method: 'POST' });
      router.refresh();
    } catch {
      setHabits(previous);
      toast.error('Erro ao atualizar hábito');
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Hábitos de hoje</CardTitle>
            <CardDescription>
              {summary.done} de {summary.active} concluídos
            </CardDescription>
          </div>
          <Link
            href="/habitos"
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={summary.percentage} className="mb-4 h-2" />
        {habits.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Crie seus primeiros hábitos.
          </p>
        ) : (
          <ul className="space-y-2">
            {habits.map((h) => (
              <li key={h.id}>
                <button
                  onClick={() => toggle(h.id)}
                  className="group flex w-full items-center gap-3 rounded-lg border border-border/40 p-3 text-left transition-colors hover:bg-accent"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                      h.doneToday ? 'border-transparent text-white' : 'border-muted-foreground/40',
                    )}
                    style={h.doneToday ? { backgroundColor: h.color } : undefined}
                  >
                    {h.doneToday && <Check className="h-4 w-4" strokeWidth={3} />}
                  </motion.div>
                  <span className="flex-1 truncate text-sm font-medium">{h.title}</span>
                  {h.streak > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                      <Flame className="h-3 w-3" /> {h.streak}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
