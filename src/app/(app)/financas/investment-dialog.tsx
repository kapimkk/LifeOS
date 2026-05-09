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
  INVESTMENT_TYPES,
  investmentSchema,
  type InvestmentInput,
} from '@/lib/validators/investment';
import {
  createInvestmentAction,
  updateInvestmentAction,
} from '@/server/actions/investments';
import type { SerializedInvestment } from '@/server/services/investments';

const COLORS = [
  '#22c55e',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#eab308',
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SerializedInvestment | null;
  onSaved: (item: SerializedInvestment) => void;
}

export function InvestmentDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: '',
      amount: 0,
      type: INVESTMENT_TYPES[0],
      color: COLORS[0],
      notes: '',
    },
  });

  const color = watch('color');
  const type = watch('type');

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset(
        editing
          ? {
              name: editing.name,
              amount: editing.amount,
              type: editing.type,
              color: editing.color,
              notes: editing.notes ?? '',
            }
          : {
              name: '',
              amount: 0,
              type: INVESTMENT_TYPES[0],
              color: COLORS[0],
              notes: '',
            },
      );
    }
  }, [open, editing, reset]);

  function onSubmit(values: InvestmentInput) {
    setSubmitError(null);
    startTransition(async () => {
      const result = editing
        ? await updateInvestmentAction(editing.id, values)
        : await createInvestmentAction(values);

      if (!result.success) {
        setSubmitError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Investimento atualizado' : 'Investimento criado');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar investimento' : 'Novo investimento'}</DialogTitle>
          <DialogDescription>
            Crie uma caixinha para acompanhar um ativo ou categoria de investimento
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: CDB Banco X 110% CDI" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor acumulado</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
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
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
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
              {editing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
