'use client';

import { useMemo, useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FixedReceivableDialog } from './fixed-receivable-dialog';
import {
  deleteFixedReceivableAction,
  setFixedReceivableMonthAction,
} from '@/modules/finance/interfaces/fixed-receivable-actions';
import type { SerializedFixedReceivable } from '@/modules/finance/domain/fixed-receivable.entities';
import { formatCurrency } from '@/lib/utils';

const MONTHS = [
  { month: 1, label: 'Jan' },
  { month: 2, label: 'Fev' },
  { month: 3, label: 'Mar' },
  { month: 4, label: 'Abr' },
  { month: 5, label: 'Mai' },
  { month: 6, label: 'Jun' },
  { month: 7, label: 'Jul' },
  { month: 8, label: 'Ago' },
  { month: 9, label: 'Set' },
  { month: 10, label: 'Out' },
  { month: 11, label: 'Nov' },
  { month: 12, label: 'Dez' },
] as const;

interface Props {
  initialItems: SerializedFixedReceivable[];
  currency: string;
}

function isMonthPaid(item: SerializedFixedReceivable, year: number, month: number) {
  return item.paidMonths.some((payment) => payment.year === year && payment.month === month);
}

export function FixedReceivablesSection({ initialItems, currency }: Props) {
  const [items, setItems] = useState(initialItems);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<SerializedFixedReceivable | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const monthlyTotal = useMemo(() => items.reduce((acc, item) => acc + item.amount, 0), [items]);
  const receivedInYear = useMemo(
    () =>
      items.reduce((acc, item) => {
        const paidCount = item.paidMonths.filter((payment) => payment.year === year).length;
        return acc + item.amount * paidCount;
      }, 0),
    [items, year],
  );
  const pendingInYear = monthlyTotal * 12 - receivedInYear;

  function handleSaved(item: SerializedFixedReceivable) {
    setItems((prev) => {
      const exists = prev.some((current) => current.id === item.id);
      return exists
        ? prev.map((current) => (current.id === item.id ? item : current))
        : [...prev, item].sort((a, b) => a.dueDay - b.dueDay || a.name.localeCompare(b.name));
    });
  }

  function handleToggleMonth(item: SerializedFixedReceivable, month: number, paid: boolean) {
    const key = `${item.id}-${year}-${month}`;
    const previous = items;
    setPendingKey(key);
    setItems(
      items.map((current) => {
        if (current.id !== item.id) return current;
        const paidMonths = paid
          ? [...current.paidMonths, { year, month }]
          : current.paidMonths.filter(
              (payment) => !(payment.year === year && payment.month === month),
            );
        return { ...current, paidMonths };
      }),
    );
    startTransition(async () => {
      const result = await setFixedReceivableMonthAction(item.id, year, month, paid);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        setItems((current) =>
          current.map((row) => (row.id === result.data.id ? result.data : row)),
        );
      }
      setPendingKey(null);
    });
  }

  function handleDelete(id: string) {
    const previous = items;
    setPendingDeleteId(id);
    setItems(items.filter((item) => item.id !== id));
    startTransition(async () => {
      const result = await deleteFixedReceivableAction(id);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        toast.success('Recebimento fixo removido');
      }
      setPendingDeleteId(null);
    });
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
            <Repeat className="h-4 w-4" />
            Total mensal fixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(monthlyTotal, currency)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Em {year}: recebido {formatCurrency(receivedInYear, currency)} · pendente{' '}
            {formatCurrency(pendingInYear, currency)}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setYear((current) => current - 1)}
            aria-label="Ano anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-16 text-center text-sm font-medium">{year}</span>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setYear((current) => current + 1)}
            aria-label="Próximo ano"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpenDialog(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Adicionar fixo
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum recebimento fixo. Cadastre salário, aluguel ou outro valor que entra todo mês.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const paidCount = item.paidMonths.filter((payment) => payment.year === year).length;
            return (
              <Card key={item.id}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.amount, currency)} · dia {item.dueDay}
                        {item.note ? ` · ${item.note}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {paidCount} de 12 meses pagos em {year}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditing(item);
                          setOpenDialog(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        disabled={pendingDeleteId === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        {pendingDeleteId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                    {MONTHS.map(({ month, label }) => {
                      const checked = isMonthPaid(item, year, month);
                      const key = `${item.id}-${year}-${month}`;
                      return (
                        <label
                          key={month}
                          className="flex flex-col items-center gap-1.5 rounded-md border border-border/60 px-1 py-2 text-xs"
                        >
                          <Checkbox
                            checked={checked}
                            disabled={pendingKey === key}
                            aria-label={`${item.name} pago em ${label} de ${year}`}
                            onCheckedChange={(value) =>
                              handleToggleMonth(item, month, value === true)
                            }
                          />
                          <span
                            className={
                              checked ? 'font-medium text-foreground' : 'text-muted-foreground'
                            }
                          >
                            {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <FixedReceivableDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        onSaved={handleSaved}
      />
    </div>
  );
}
