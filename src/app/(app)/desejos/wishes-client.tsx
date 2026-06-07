'use client';

import { useMemo, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Gift, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WishDialog } from './wish-dialog';
import { deleteWishAction } from '@/modules/wishes/interfaces/actions';
import type { SerializedWishItem, WishCategory } from '@/modules/wishes/domain/entities';
import { WISH_CATEGORIES, WISH_CATEGORY_LABELS } from '@/lib/validators/wish';
import { formatCurrency } from '@/lib/utils';

interface Props {
  initialItems: SerializedWishItem[];
  currency: string;
}

export function WishesClient({ initialItems, currency }: Props) {
  const [items, setItems] = useState(initialItems);
  const [categoryTab, setCategoryTab] = useState<WishCategory>('ELETRONICOS');
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<SerializedWishItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((w) => {
      if (w.category !== categoryTab) return false;
      if (
        q &&
        !w.name.toLowerCase().includes(q) &&
        !(w.description ?? '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [items, search, categoryTab]);

  const categoryTotal = useMemo(() => filtered.reduce((acc, w) => acc + w.price, 0), [filtered]);

  function handleSaved(item: SerializedWishItem) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) return prev.map((i) => (i.id === item.id ? item : i));
      return [item, ...prev];
    });
  }

  function handleDelete(id: string) {
    setPendingId(id);
    const previous = items;
    setItems((prev) => prev.filter((w) => w.id !== id));
    startTransition(async () => {
      const result = await deleteWishAction(id);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        toast.success('Desejo removido');
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={categoryTab}
        onValueChange={(v) => setCategoryTab(v as WishCategory)}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="flex h-auto flex-wrap gap-1">
            {WISH_CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="text-xs sm:text-sm">
                {WISH_CATEGORY_LABELS[c]}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpenDialog(true);
            }}
          >
            <Plus className="h-4 w-4" /> Adicionar desejo
          </Button>
        </div>

        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar na categoria..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {WISH_CATEGORIES.map((category) => (
          <TabsContent key={category} value={category} className="mt-0 space-y-3">
            {category === categoryTab && filtered.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Subtotal {WISH_CATEGORY_LABELS[category]}:{' '}
                <strong className="text-foreground">
                  {formatCurrency(categoryTotal, currency)}
                </strong>
              </p>
            )}

            {category === categoryTab && filtered.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Gift className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">
                    Nenhum desejo em {WISH_CATEGORY_LABELS[category]}
                  </p>
                </CardContent>
              </Card>
            ) : category === categoryTab ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence initial={false}>
                  {filtered.map((w) => {
                    const isPending = pendingId === w.id;
                    return (
                      <motion.div
                        key={w.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: isPending ? 0.6 : 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                      >
                        <Card className="group flex h-full flex-col hover:border-primary/40">
                          <CardContent className="flex flex-1 flex-col gap-3 p-5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 font-medium">{w.name}</p>
                                <p className="mt-1 text-lg font-semibold text-primary">
                                  {formatCurrency(w.price, currency)}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setEditing(w);
                                    setOpenDialog(true);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  disabled={isPending}
                                  onClick={() => handleDelete(w.id)}
                                >
                                  {isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {w.description && (
                              <p className="line-clamp-2 text-sm text-muted-foreground">
                                {w.description}
                              </p>
                            )}

                            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                              <Badge variant="outline">{WISH_CATEGORY_LABELS[w.category]}</Badge>
                            </div>

                            {w.link && (
                              <Button asChild size="sm" variant="outline" className="w-full">
                                <a href={w.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Ver link
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>

      <WishDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        defaultCategory={categoryTab}
        onSaved={handleSaved}
      />
    </div>
  );
}
