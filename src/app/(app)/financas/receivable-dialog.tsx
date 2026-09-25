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
import { receivableSchema, type ReceivableInput } from '@/lib/validators/receivable';
import {
  createReceivableAction,
  updateReceivableAction,
} from '@/modules/finance/interfaces/receivable-actions';
import type { SerializedReceivable } from '@/modules/finance/domain/receivable.entities';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SerializedReceivable | null;
  onSaved: (item: SerializedReceivable) => void;
}

export function ReceivableDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReceivableInput>({
    resolver: zodResolver(receivableSchema),
    defaultValues: { debtorName: '', amount: 0, note: '' },
  });

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      reset(
        editing
          ? { debtorName: editing.debtorName, amount: editing.amount, note: editing.note ?? '' }
          : { debtorName: '', amount: 0, note: '' },
      );
    }
  }, [open, editing, reset]);

  function onSubmit(values: ReceivableInput) {
    setSubmitError(null);
    startTransition(async () => {
      const result = editing
        ? await updateReceivableAction(editing.id, values)
        : await createReceivableAction(values);

      if (!result.success) {
        setSubmitError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Registro atualizado' : 'Pessoa adicionada');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar a receber' : 'Quem me deve'}</DialogTitle>
          <DialogDescription>Registre a pessoa e o valor que ainda vai receber.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="rec-name">Quem deve</Label>
            <Input
              id="rec-name"
              placeholder="Ex.: João, empresa X..."
              {...register('debtorName')}
            />
            {errors.debtorName && (
              <p className="text-xs text-destructive">{errors.debtorName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rec-amount">Valor (R$)</Label>
            <Input
              id="rec-amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rec-note">Observação</Label>
            <Textarea
              id="rec-note"
              placeholder="Opcional: motivo, prazo ou combinação"
              {...register('note')}
            />
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
