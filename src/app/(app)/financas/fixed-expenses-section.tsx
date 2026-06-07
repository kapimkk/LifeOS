'use client';

import { useMemo, useState, useTransition } from 'react';
import { CalendarClock, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FixedExpenseDialog } from './fixed-expense-dialog';
import { deleteFixedExpenseAction } from '@/modules/finance/interfaces/fixed-expense-actions';
import type { SerializedFixedExpense } from '@/modules/finance/domain/fixed-expense.entities';
import { formatCurrency } from '@/lib/utils';

interface Props {
  initialItems: SerializedFixedExpense[];
  initialTotal: number;
  currency: string;
}

export function FixedExpensesSection({ initialItems, initialTotal, currency }: Props) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<SerializedFixedExpense | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.dueDate - b.dueDate || a.name.localeCompare(b.name)),
    [items],
  );

  function recalcTotal(list: SerializedFixedExpense[]) {
    return list.reduce((acc, i) => acc + i.amount, 0);
  }

  function handleSaved(item: SerializedFixedExpense) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      const next = idx >= 0 ? prev.map((i) => (i.id === item.id ? item : i)) : [item, ...prev];
      setTotal(recalcTotal(next));
      return next;
    });
  }

  function handleDelete(id: string) {
    setPendingId(id);
    const previous = items;
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    setTotal(recalcTotal(next));
    startTransition(async () => {
      const result = await deleteFixedExpenseAction(id);
      if (!result.success) {
        setItems(previous);
        setTotal(recalcTotal(previous));
        toast.error(result.error);
      } else {
        toast.success('Gasto fixo removido');
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            Valor total de gastos fixos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(total, currency)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} despesa{items.length !== 1 ? 's' : ''} recorrente
            {items.length !== 1 ? 's' : ''} no mês
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpenDialog(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Adicionar gasto fixo
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum gasto fixo cadastrado. Adicione aluguel, assinaturas e outras contas mensais.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Vencimento</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((item) => {
                  const isPending = pendingId === item.id;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">Dia {item.dueDate}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.amount, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
                            disabled={isPending}
                            onClick={() => handleDelete(item.id)}
                          >
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <FixedExpenseDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        onSaved={handleSaved}
      />
    </div>
  );
}
