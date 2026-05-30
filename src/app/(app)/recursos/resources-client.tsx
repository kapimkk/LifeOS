'use client';

import { useMemo, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Download,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceDialog } from './resource-dialog';
import {
  deleteResourceAction,
  toggleResourceDoneAction,
} from '@/modules/resources/interfaces/actions';
import type {
  ResourceVaultCategory,
  SerializedResource,
} from '@/modules/resources/domain/entities';
import { RESOURCE_VAULT_CATEGORIES, RESOURCE_VAULT_LABELS } from '@/lib/validators/resource';
import { downloadXlsx } from '@/lib/export-xlsx';
import { cn, formatDate } from '@/lib/utils';

interface Props {
  initialResources: SerializedResource[];
}

const STATUS_LABEL: Record<SerializedResource['status'], string> = {
  TO_READ: 'Para ler',
  IN_PROGRESS: 'Lendo',
  DONE: 'Concluído',
  ARCHIVED: 'Arquivado',
};

const STATUS_VARIANT: Record<
  SerializedResource['status'],
  'default' | 'success' | 'warning' | 'secondary'
> = {
  TO_READ: 'default',
  IN_PROGRESS: 'warning',
  DONE: 'success',
  ARCHIVED: 'secondary',
};

export function ResourcesClient({ initialResources }: Props) {
  const [items, setItems] = useState(initialResources);
  const [vaultTab, setVaultTab] = useState<ResourceVaultCategory>('ESTUDOS');
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<SerializedResource | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filteredByVault = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (r.vaultCategory !== vaultTab) return false;
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !(r.description ?? '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [items, search, vaultTab]);

  function handleSaved(item: SerializedResource) {
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

  function handleToggle(id: string) {
    setPendingId(id);
    const previous = items;
    setItems((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'DONE' ? 'TO_READ' : 'DONE' } : r,
      ),
    );
    startTransition(async () => {
      const result = await toggleResourceDoneAction(id);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        setItems((prev) => prev.map((r) => (r.id === id ? result.data : r)));
      }
      setPendingId(null);
    });
  }

  function handleDelete(id: string) {
    setPendingId(id);
    const previous = items;
    setItems((prev) => prev.filter((r) => r.id !== id));
    startTransition(async () => {
      const result = await deleteResourceAction(id);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        toast.success('Recurso removido');
      }
      setPendingId(null);
    });
  }

  function exportCategory(category: ResourceVaultCategory, rows: SerializedResource[]) {
    if (rows.length === 0) {
      toast.message('Nada para exportar nesta categoria.');
      return;
    }
    const label = RESOURCE_VAULT_LABELS[category];
    downloadXlsx(
      `recursos-${label.toLowerCase()}.xlsx`,
      label,
      ['Título', 'URL', 'Descrição', 'Status', 'Criado em'],
      rows.map((r) => [
        r.title,
        r.url,
        r.description ?? '',
        STATUS_LABEL[r.status],
        formatDate(r.createdAt),
      ]),
    );
    toast.success(`Planilha ${label} baixada`);
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={vaultTab}
        onValueChange={(v) => setVaultTab(v as ResourceVaultCategory)}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="flex h-auto flex-wrap gap-1">
            {RESOURCE_VAULT_CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="text-xs sm:text-sm">
                {RESOURCE_VAULT_LABELS[c]}
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
            <Plus className="h-4 w-4" /> Adicionar recurso
          </Button>
        </div>

        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar título ou descrição..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {RESOURCE_VAULT_CATEGORIES.map((category) => {
          const inTab = category === vaultTab;
          const rows = inTab ? filteredByVault : [];
          return (
            <TabsContent key={category} value={category} className="mt-0 space-y-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => exportCategory(category, rows)}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Baixar {RESOURCE_VAULT_LABELS[category]} (.xlsx)
                </Button>
              </div>

              {rows.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Bookmark className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Nenhum recurso em {RESOURCE_VAULT_LABELS[category]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Salve links nesta categoria para organizar seu cofre.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence initial={false}>
                    {rows.map((r) => {
                      const done = r.status === 'DONE';
                      const isPending = pendingId === r.id;
                      return (
                        <motion.div
                          key={r.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: isPending ? 0.6 : 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                        >
                          <Card
                            className={cn(
                              'group flex h-full flex-col transition-colors hover:border-primary/40',
                              done && 'opacity-80',
                            )}
                          >
                            <CardContent className="flex flex-1 flex-col gap-3 p-5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={cn(
                                      'line-clamp-2 font-medium',
                                      done && 'text-muted-foreground line-through',
                                    )}
                                  >
                                    {r.title}
                                  </p>
                                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                    {hostnameFromUrl(r.url)}
                                  </p>
                                </div>
                                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      setEditing(r);
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
                                    onClick={() => handleDelete(r.id)}
                                  >
                                    {isPending ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {r.description && (
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                  {r.description}
                                </p>
                              )}

                              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                                <Badge variant="outline">
                                  {RESOURCE_VAULT_LABELS[r.vaultCategory]}
                                </Badge>
                                <Badge variant={STATUS_VARIANT[r.status]}>
                                  {STATUS_LABEL[r.status]}
                                </Badge>
                                <span className="ml-auto text-[10px] text-muted-foreground">
                                  {formatDate(r.createdAt)}
                                </span>
                              </div>

                              <div className="flex gap-2 pt-1">
                                <Button asChild size="sm" variant="outline" className="flex-1">
                                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Abrir
                                    <ArrowUpRight className="ml-auto h-3 w-3 opacity-60" />
                                  </a>
                                </Button>
                                <Button
                                  size="sm"
                                  variant={done ? 'success' : 'secondary'}
                                  onClick={() => handleToggle(r.id)}
                                  disabled={isPending}
                                  className="shrink-0"
                                  aria-label={done ? 'Marcar como não lido' : 'Marcar como lido'}
                                >
                                  {isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                  {done ? 'Lido' : 'Lido?'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <ResourceDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        defaultVaultCategory={vaultTab}
        onSaved={handleSaved}
      />
    </div>
  );
}

function hostnameFromUrl(raw: string) {
  try {
    return new URL(raw).hostname.replace(/^www\./, '');
  } catch {
    return raw;
  }
}
