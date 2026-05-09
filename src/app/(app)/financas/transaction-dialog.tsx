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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/fetcher';
import { transactionSchema, type TransactionInput } from '@/lib/validators/transaction';
import type { CategoryOption, TransactionItem } from './transactions-client';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: CategoryOption[];
  onCreated: (item: TransactionItem) => void;
}

export function TransactionDialog({ open, onOpenChange, categories, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      amount: 0,
      description: '',
      notes: '',
      categoryId: undefined,
      date: new Date().toISOString().slice(0, 10),
      recurrence: 'NONE',
    },
  });

  const type = watch('type');
  const visibleCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (open) {
      reset({
        type: 'EXPENSE',
        amount: 0,
        description: '',
        notes: '',
        date: new Date().toISOString().slice(0, 10),
        recurrence: 'NONE',
      });
    }
  }, [open, reset]);

  async function onSubmit(values: TransactionInput) {
    setSubmitting(true);
    try {
      const created = await apiFetch<TransactionItem>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          date: new Date(values.date as string).toISOString(),
        }),
      });
      toast.success('Transação criada');
      onCreated(created);
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
          <DialogTitle>Nova transação</DialogTitle>
          <DialogDescription>Registre uma receita ou despesa</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(v) => setValue('type', v as 'INCOME' | 'EXPENSE')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                  <SelectItem value="INCOME">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
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
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Ex.: Mercado da semana" {...register('description')} />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={watch('categoryId') ?? ''}
                onValueChange={(v) => setValue('categoryId', v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {visibleCategories.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground">
                      Nenhuma categoria
                    </div>
                  ) : (
                    visibleCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register('date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recorrência</Label>
            <Select
              value={watch('recurrence')}
              onValueChange={(v) => setValue('recurrence', v as TransactionInput['recurrence'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Sem recorrência</SelectItem>
                <SelectItem value="DAILY">Diária</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="YEARLY">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
