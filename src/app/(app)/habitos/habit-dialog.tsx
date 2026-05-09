'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/fetcher';
import { habitSchema, type HabitInput } from '@/lib/validators/habit';
import type { HabitItem } from './habits-client';
import { cn } from '@/lib/utils';

const COLORS = [
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#10b981',
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (item: HabitItem) => void;
}

export function HabitDialog({ open, onOpenChange, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HabitInput>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: '',
      description: '',
      color: COLORS[0],
      targetPerDay: 1,
      active: true,
    },
  });

  const color = watch('color');

  useEffect(() => {
    if (open) {
      reset({ title: '', description: '', color: COLORS[0], targetPerDay: 1, active: true });
    }
  }, [open, reset]);

  async function onSubmit(values: HabitInput) {
    setSubmitting(true);
    try {
      const created = await apiFetch<HabitItem>('/api/habits', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('Hábito criado');
      onCreated({
        ...created,
        streak: 0,
        longestStreak: 0,
        doneToday: false,
        consistency30d: 0,
        last30: Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return { date: d.toISOString().slice(0, 10), done: false };
        }),
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo hábito</DialogTitle>
          <DialogDescription>
            Comece pequeno. A consistência é mais importante que a intensidade.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ex.: Beber 2L de água" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea id="description" rows={2} {...register('description')} />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition-transform',
                    color === c
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:scale-105',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
