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
import { transactionSchema, type TransactionInput } from '@/lib/validators/transaction';
import type { CategoryOption } from './transactions-client';
import {
  createTransactionAction,
  updateTransactionAction,
} from '@/modules/finance/interfaces/transaction-actions';
import { formatNextChargeMonthLabel } from '@/modules/finance/domain/installment-rules';
import type { SerializedTransaction } from '@/types/finance-transaction';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: CategoryOption[];
  mode: 'create' | 'edit';
  initialTransaction?: SerializedTransaction | null;
  onCreatedMany: (items: SerializedTransaction[]) => void;
  onUpdated: (item: SerializedTransaction) => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  categories,
  mode,
  initialTransaction,
  onCreatedMany,
  onUpdated,
}: Props) {
  const editingId = mode === 'edit' && initialTransaction ? initialTransaction.id : null;
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
      paymentMethod: 'CASH',
      installments: 1,
    },
  });

  const type = watch('type');
  const paymentMethod = watch('paymentMethod');
  const dateStr = watch('date');
  const installments = watch('installments');

  const visibleCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialTransaction) {
      reset({
        type: initialTransaction.type,
        amount: initialTransaction.amount,
        description: initialTransaction.description.replace(/\s*\(\d+\/\d+\)\s*$/, ''),
        notes: initialTransaction.notes ?? '',
        categoryId: initialTransaction.categoryId ?? undefined,
        date: initialTransaction.date.slice(0, 10),
        recurrence: initialTransaction.recurrence,
        paymentMethod: initialTransaction.paymentMethod,
        installments: initialTransaction.installments,
      });
      return;
    }
    reset({
      type: 'EXPENSE',
      amount: 0,
      description: '',
      notes: '',
      categoryId: undefined,
      date: new Date().toISOString().slice(0, 10),
      recurrence: 'NONE',
      paymentMethod: 'CASH',
      installments: 1,
    });
  }, [open, mode, initialTransaction, reset]);

  async function onSubmit(values: TransactionInput) {
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateTransactionAction(editingId, values);
        if (!res.success) {
          toast.error(res.error ?? 'Erro ao atualizar');
          return;
        }
        onUpdated(res.data);
        return;
      }

      const res = await createTransactionAction({
        ...values,
        date:
          typeof values.date === 'string'
            ? new Date(values.date + 'T12:00:00').toISOString()
            : values.date,
      });
      if (!res.success) {
        toast.error(res.error ?? 'Erro ao criar');
        return;
      }
      onCreatedMany(res.data.items);
    } finally {
      setSubmitting(false);
    }
  }

  const recurrenceVisible =
    type === 'INCOME' || (type === 'EXPENSE' && paymentMethod !== 'CREDIT_CARD');

  const showInstallments =
    type === 'EXPENSE' && paymentMethod === 'CREDIT_CARD' && mode === 'create';

  const purchaseAnchor =
    typeof dateStr === 'string'
      ? new Date(dateStr + 'T12:00:00')
      : dateStr instanceof Date
        ? dateStr
        : new Date();

  const nextChargeHint =
    type === 'EXPENSE' && paymentMethod === 'CREDIT_CARD' && mode === 'create'
      ? formatNextChargeMonthLabel(purchaseAnchor)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Editar transação' : 'Nova transação'}</DialogTitle>
          <DialogDescription>Registre uma receita ou despesa.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                disabled={Boolean(editingId && initialTransaction?.installmentGroupId)}
                value={type}
                onValueChange={(v) => {
                  setValue('type', v as 'INCOME' | 'EXPENSE');
                  if (v === 'INCOME') {
                    setValue('paymentMethod', 'CASH');
                    setValue('installments', 1);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                  <SelectItem value="INCOME">Receita</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">
                Valor{showInstallments && installments > 1 ? ' total' : ''}
              </Label>
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
            <Input
              id="description"
              placeholder="Ex.: Mercado da semana"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={watch('categoryId') ?? ''}
                onValueChange={(v) => setValue('categoryId', v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {visibleCategories.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground">Nenhuma categoria</div>
                  ) : (
                    visibleCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-date">
                {mode === 'edit' ? 'Data de vencimento' : 'Data da compra/recebimento'}
              </Label>
              <Input id="tx-date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => {
                setValue('paymentMethod', v as TransactionInput['paymentMethod']);
                if (v !== 'CREDIT_CARD') setValue('installments', 1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Dinheiro / Conta</SelectItem>
                <SelectItem value="PIX">Pix</SelectItem>
                <SelectItem value="DEBIT">Cartão débito</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de crédito</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>
            )}
          </div>

          {recurrenceVisible && (
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
          )}

          {showInstallments && (
            <div className="space-y-2">
              <Label htmlFor="inst">Número de parcelas</Label>
              <Input
                id="inst"
                type="number"
                min={1}
                max={60}
                {...register('installments', { valueAsNumber: true })}
              />
              {errors.installments && (
                <p className="text-xs text-destructive">{errors.installments.message}</p>
              )}
            </div>
          )}

          {nextChargeHint && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
              Esta despesa no cartão começará a ser cobrada na fatura em{' '}
              <strong className="capitalize">{nextChargeHint}</strong>
              {installments > 1 && ` — ${installments} parcelas distribuídas nos meses seguintes.`}
            </div>
          )}

          {mode === 'edit' &&
            initialTransaction?.installmentNumber != null &&
            initialTransaction.installments > 1 && (
              <p className="text-xs text-muted-foreground">
                Parcela{' '}
                <strong>
                  {initialTransaction.installmentNumber}/{initialTransaction.installments}
                </strong>
                . Ao editar apenas este lançamento, as demais parcelas não são alteradas.
              </p>
            )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
