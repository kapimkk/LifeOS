'use client';

import { useState, useTransition } from 'react';
import { HandCoins, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { ReceivableDialog } from './receivable-dialog';
import { deleteReceivableAction } from '@/modules/finance/interfaces/receivable-actions';
import type { SerializedReceivable } from '@/modules/finance/domain/receivable.entities';
import { formatCurrency } from '@/lib/utils';

interface Props {
  initialItems: SerializedReceivable[];
  initialTotal: number;
  currency: string;
}

export function ReceivablesSection({ initialItems, initialTotal, currency }: Props) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<SerializedReceivable | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function recalcTotal(list: SerializedReceivable[]) {
    return list.reduce((acc, item) => acc + item.amount, 0);
  }

  function handleSaved(item: SerializedReceivable) {
    setItems((prev) => {
      const exists = prev.some((current) => current.id === item.id);
      const next = exists
        ? prev.map((current) => (current.id === item.id ? item : current))
        : [item, ...prev];
      setTotal(recalcTotal(next));
      return next;
    });
  }

  function handleDelete(id: string) {
    setPendingId(id);
    const previous = items;
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    setTotal(recalcTotal(next));
    startTransition(async () => {
      const result = await deleteReceivableAction(id);
      if (!result.success) {
        setItems(previous);
        setTotal(recalcTotal(previous));
        toast.error(result.error);
      } else {
        toast.success('Registro removido');
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
            <HandCoins className="h-4 w-4" />
            Total a receber
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(total, currency)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length === 1 ? '1 pessoa te deve' : `${items.length} pessoas te devem`}
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
          Adicionar quem deve
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Ninguém cadastrado. Adicione quem ainda vai te pagar.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quem deve</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isPending = pendingId === item.id;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.debtorName}</TableCell>
                      <TableCell className="text-muted-foreground">{item.note || '—'}</TableCell>
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

      <ReceivableDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        onSaved={handleSaved}
      />
    </div>
  );
}
