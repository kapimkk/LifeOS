'use client';

import { useMemo, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Pencil, Plus, TrendingUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { InvestmentDialog } from './investment-dialog';
import { deleteInvestmentAction } from '@/modules/finance/interfaces/actions';
import type { SerializedInvestment } from '@/modules/finance/domain/entities';
import { formatCurrency } from '@/lib/utils';

interface Props {
  initialInvestments: SerializedInvestment[];
  currency: string;
}

export function InvestmentsSection({ initialInvestments, currency }: Props) {
  const [items, setItems] = useState(initialInvestments);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<SerializedInvestment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = useMemo(() => items.reduce((acc, i) => acc + i.amount, 0), [items]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) map.set(i.type, (map.get(i.type) ?? 0) + i.amount);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  function handleSaved(item: SerializedInvestment) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      const previous = items;
      setItems((prev) => prev.filter((i) => i.id !== id));
      const result = await deleteInvestmentAction(id);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        toast.success('Investimento removido');
      }
      setDeletingId(null);
    });
  }

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            Meus investimentos
          </CardTitle>
          <CardDescription>
            {items.length === 0
              ? 'Crie sua primeira caixinha de investimento'
              : `${items.length} caixinhas · ${formatCurrency(total, currency)} acumulados`}
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpenDialog(true);
          }}
        >
          <Plus className="h-4 w-4" /> Adicionar investimento
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {byType.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {byType.map(([type, value]) => (
              <Badge key={type} variant="outline" className="gap-1.5">
                <span>{type}</span>
                <span className="text-muted-foreground">·</span>
                <span className="tabular-nums">{formatCurrency(value, currency)}</span>
              </Badge>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
            Nenhum investimento cadastrado ainda.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {items.map((inv) => {
                const share = total > 0 ? Math.round((inv.amount / total) * 100) : 0;
                const removing = deletingId === inv.id && isPending;
                return (
                  <motion.div
                    key={inv.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: removing ? 0.4 : 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ backgroundColor: inv.color }}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: inv.color }}
                          />
                          <p className="truncate text-sm font-medium">{inv.name}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{inv.type}</p>
                      </div>
                      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditing(inv);
                            setOpenDialog(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          disabled={removing}
                          onClick={() => handleDelete(inv.id)}
                        >
                          {removing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="mt-3 text-xl font-semibold tabular-nums">
                      {formatCurrency(inv.amount, currency)}
                    </p>
                    {total > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${share}%`, backgroundColor: inv.color }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {share}%
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isPending && deletingId === null && <Skeleton className="h-32 rounded-xl" />}
          </div>
        )}
      </CardContent>

      <InvestmentDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        onSaved={handleSaved}
      />
    </Card>
  );
}
