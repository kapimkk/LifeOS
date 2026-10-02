'use client';

import { useEffect, useState, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  fixedReceivableSchema,
  type FixedReceivableInput,
} from '@/lib/validators/fixed-receivable';
import {
  createFixedReceivableAction,
  updateFixedReceivableAction,
} from '@/modules/finance/interfaces/fixed-receivable-actions';
import type { SerializedFixedReceivable } from '@/modules/finance/domain/fixed-receivable.entities';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SerializedFixedReceivable | null;
  onSaved: (item: SerializedFixedReceivable) => void;
}

const DUE_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

export function FixedReceivableDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FixedReceivableInput>({
    resolver: zodResolver(fixedReceivableSchema),
    defaultValues: { name: '', amount: 0, dueDay: 1, note: '' },
  });

  const dueDay = watch('dueDay');

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset(
        editing
          ? {
              name: editing.name,
              amount: editing.amount,
              dueDay: editing.dueDay,
              note: editing.note ?? '',
            }
          : { name: '', amount: 0, dueDay: 1, note: '' },
      );
    }
  }, [open, editing, reset]);

  function onSubmit(values: FixedReceivableInput) {
    setSubmitError(null);
    startTransition(async () => {
      const result = editing
        ? await updateFixedReceivableAction(editing.id, values)
        : await createFixedReceivableAction(values);

      if (!result.success) {
        setSubmitError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Recebimento fixo atualizado' : 'Recebimento fixo adicionado');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar recebimento fixo' : 'Novo recebimento fixo'}</DialogTitle>
          <DialogDescription>
            Valor que entra todo mês. Os meses pagos ficam salvos.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="fr-name">Origem</Label>
            <Input
              id="fr-name"
              placeholder="Ex.: Salário, aluguel recebido..."
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fr-amount">Valor (R$)</Label>
              <Input
                id="fr-amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Dia do recebimento</Label>
              <Select
                value={String(dueDay)}
                onValueChange={(value) => setValue('dueDay', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_DAYS.map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      Dia {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dueDay && <p className="text-xs text-destructive">{errors.dueDay.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fr-note">Observação</Label>
            <Textarea id="fr-note" placeholder="Opcional" {...register('note')} />
            {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
          </div>

          {submitError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
