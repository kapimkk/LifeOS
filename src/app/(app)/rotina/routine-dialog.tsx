'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ROUTINE_CATEGORIES,
  ROUTINE_CATEGORY_COLORS,
  WEEK_DAYS,
  WEEK_DAY_LABELS,
  minutesToTime,
  routineItemSchema,
  timeToMinutes,
  type RoutineItemInput,
  type WeekDay,
} from '@/lib/validators/routine';
import {
  createRoutineItemAction,
  deleteRoutineItemAction,
  updateRoutineItemAction,
} from '@/modules/routine/interfaces/actions';
import type { SerializedRoutineItem } from '@/modules/routine/domain/entities';

const COLORS = [
  '#6366f1',
  '#06b6d4',
  '#22c55e',
  '#f97316',
  '#8b5cf6',
  '#eab308',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
  '#64748b',
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SerializedRoutineItem | null;
  defaultDay: WeekDay;
  defaultStartMinute?: number;
  onSaved: (item: SerializedRoutineItem) => void;
  onDeleted: (id: string) => void;
}

function defaultsFor(
  editing: SerializedRoutineItem | null,
  defaultDay: WeekDay,
  defaultStartMinute?: number,
): RoutineItemInput {
  if (editing) {
    return {
      day: editing.day,
      startMinute: editing.startMinute,
      endMinute: editing.endMinute,
      title: editing.title,
      description: editing.description ?? '',
      category: editing.category,
      color: editing.color,
    };
  }
  const start = defaultStartMinute ?? 9 * 60;
  return {
    day: defaultDay,
    startMinute: start,
    endMinute: Math.min(start + 60, 1440),
    title: '',
    description: '',
    category: 'Outro',
    color: COLORS[0],
  };
}

export function RoutineDialog({
  open,
  onOpenChange,
  editing,
  defaultDay,
  defaultStartMinute,
  onSaved,
  onDeleted,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoutineItemInput>({
    resolver: zodResolver(routineItemSchema),
    defaultValues: defaultsFor(editing, defaultDay, defaultStartMinute),
  });

  const day = watch('day');
  const category = watch('category');
  const color = watch('color');
  const startMinute = watch('startMinute');
  const endMinute = watch('endMinute');

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset(defaultsFor(editing, defaultDay, defaultStartMinute));
    }
  }, [open, editing, defaultDay, defaultStartMinute, reset]);

  function onSubmit(values: RoutineItemInput) {
    setSubmitError(null);
    const payload: RoutineItemInput = {
      ...values,
      description: values.description?.trim() ? values.description.trim() : null,
    };
    startTransition(async () => {
      const result = editing
        ? await updateRoutineItemAction(editing.id, payload)
        : await createRoutineItemAction(payload);

      if (!result.success) {
        setSubmitError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Item atualizado' : 'Item adicionado à rotina');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!editing) return;
    startDeleteTransition(async () => {
      const result = await deleteRoutineItemAction(editing.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success('Item removido');
      onDeleted(editing.id);
      onOpenChange(false);
    });
  }

  const busy = isPending || isDeleting;

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar item da rotina' : 'Novo item da rotina'}</DialogTitle>
          <DialogDescription>
            Defina o dia, horário e o que fazer nesse bloco da semana.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="routine-title">Título</Label>
            <Input
              id="routine-title"
              placeholder="Ex.: Academia, Reunião de time, Estudar inglês..."
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Dia da semana</Label>
            <Select value={day} onValueChange={(v) => setValue('day', v as WeekDay)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEK_DAYS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {WEEK_DAY_LABELS[d]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="routine-start">Início</Label>
              <Input
                id="routine-start"
                type="time"
                value={minutesToTime(startMinute ?? 0)}
                onChange={(e) => setValue('startMinute', timeToMinutes(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routine-end">Fim</Label>
              <Input
                id="routine-end"
                type="time"
                value={minutesToTime(endMinute === 1440 ? 0 : (endMinute ?? 60))}
                onChange={(e) => {
                  const raw = timeToMinutes(e.target.value);
                  // "00:00" digitado como fim = meia-noite (fim do dia = 1440).
                  setValue('endMinute', raw === 0 ? 1440 : raw);
                }}
              />
            </div>
          </div>
          {errors.endMinute && (
            <p className="-mt-2 text-xs text-destructive">{errors.endMinute.message}</p>
          )}

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(v) => {
                setValue('category', v);
                const suggested =
                  ROUTINE_CATEGORY_COLORS[v as keyof typeof ROUTINE_CATEGORY_COLORS];
                if (suggested) setValue('color', suggested);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROUTINE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Cor ${c}`}
                  onClick={() => setValue('color', c)}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition-transform',
                    color === c
                      ? 'scale-110 border-foreground'
                      : 'border-transparent hover:scale-105',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="routine-desc">Observações (opcional)</Label>
            <Textarea id="routine-desc" rows={2} {...register('description')} />
          </div>

          {submitError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {editing ? (
              <Button
                type="button"
                variant="ghost"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={busy}
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Excluir
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={busy}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={busy}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
