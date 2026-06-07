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
import { fixedExpenseSchema, type FixedExpenseInput } from '@/lib/validators/fixed-expense';
import {
  createFixedExpenseAction,
  updateFixedExpenseAction,
} from '@/modules/finance/interfaces/fixed-expense-actions';
import type { SerializedFixedExpense } from '@/modules/finance/domain/fixed-expense.entities';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SerializedFixedExpense | null;
  onSaved: (item: SerializedFixedExpense) => void;
}

const DUE_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function FixedExpenseDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FixedExpenseInput>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: { name: '', amount: 0, dueDate: 1 },
  });

  const dueDate = watch('dueDate');

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset(
        editing
          ? { name: editing.name, amount: editing.amount, dueDate: editing.dueDate }
          : { name: '', amount: 0, dueDate: 1 },
      );
    }
  }, [open, editing, reset]);

  function onSubmit(values: FixedExpenseInput) {
    setSubmitError(null);
    startTransition(async () => {
      const result = editing
        ? await updateFixedExpenseAction(editing.id, values)
        : await createFixedExpenseAction(values);

      if (!result.success) {
        setSubmitError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Gasto fixo atualizado' : 'Gasto fixo adicionado');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar gasto fixo' : 'Novo gasto fixo'}</DialogTitle>
          <DialogDescription>Despesa recorrente com dia de vencimento no mês</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="fe-name">Nome</Label>
            <Input id="fe-name" placeholder="Ex.: Aluguel, Internet..." {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fe-amount">Valor (R$)</Label>
              <Input
                id="fe-amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Vencimento (dia)</Label>
              <Select value={String(dueDate)} onValueChange={(v) => setValue('dueDate', Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DUE_DAYS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      Dia {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dueDate && (
                <p className="text-xs text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
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
