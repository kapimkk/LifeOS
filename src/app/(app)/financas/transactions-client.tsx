'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownCircle, ArrowUpCircle, Plus, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionDialog } from './transaction-dialog';
import { apiFetch } from '@/lib/fetcher';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export interface CategoryOption {
  id: string;
  name: string;
  color: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string | null;
}

export interface TransactionItem {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  notes?: string | null;
  categoryId?: string | null;
  date: string;
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  category?: { id: string; name: string; color: string } | null;
}

interface Props {
  initialTransactions: TransactionItem[];
  categories: CategoryOption[];
  currency: string;
}

export function TransactionsClient({ initialTransactions, categories, currency }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialTransactions);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [categoryId, setCategoryId] = useState<'all' | string>('all');
  const [openDialog, setOpenDialog] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (categoryId !== 'all' && t.categoryId !== categoryId) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, type, categoryId]);

  async function handleDelete(id: string) {
    const previous = items;
    setItems((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' });
      toast.success('Transação removida');
      router.refresh();
    } catch {
      setItems(previous);
      toast.error('Erro ao remover transação');
    }
  }

  function handleCreated(item: TransactionItem) {
    setItems((prev) => [item, ...prev]);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Transações</CardTitle>
          <CardDescription>{filtered.length} registros</CardDescription>
        </div>
        <Button size="sm" onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4" /> Nova transação
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="INCOME">Receitas</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
            Nenhuma transação encontrada.
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            <AnimatePresence initial={false}>
              {filtered.map((t) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center gap-3 py-3"
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      t.type === 'INCOME'
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {t.type === 'INCOME' ? (
                      <ArrowUpCircle className="h-4 w-4" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.description}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(t.date)}</span>
                      {t.category && (
                        <Badge
                          variant="outline"
                          className="border-transparent px-1.5"
                          style={{
                            backgroundColor: `${t.category.color}20`,
                            color: t.category.color,
                          }}
                        >
                          {t.category.name}
                        </Badge>
                      )}
                      {t.recurrence !== 'NONE' && (
                        <Badge variant="outline" className="px-1.5 text-[10px]">
                          {t.recurrence.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'shrink-0 text-sm font-semibold tabular-nums',
                      t.type === 'INCOME' ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {t.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(t.amount, currency)}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>

      <TransactionDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        categories={categories}
        onCreated={handleCreated}
      />
    </Card>
  );
}
