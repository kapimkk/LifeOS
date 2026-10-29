'use client';

import { useMemo, useState, useTransition } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ClientDialog } from './client-dialog';
import { CLIENT_STATUS_LABEL, PROJECT_STATUS_LABEL } from '../labels';
import { deleteCustomerAction } from '@/modules/gestao/interfaces/actions';
import type { SerializedCustomer, SerializedProject } from '@/modules/gestao/domain/entities';

interface Props {
  initialCustomers: SerializedCustomer[];
  projects: SerializedProject[];
}

export function ClientsSection({ initialCustomers, projects }: Props) {
  const [items, setItems] = useState(initialCustomers);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SerializedCustomer | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.company, item.email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [items, query]);

  function handleSaved(item: SerializedCustomer) {
    setItems((prev) => {
      const exists = prev.some((current) => current.id === item.id);
      const next = exists
        ? prev.map((current) => (current.id === item.id ? item : current))
        : [...prev, item];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  function handleDelete(id: string) {
    const previous = items;
    setPendingId(id);
    setItems(items.filter((item) => item.id !== id));
    startTransition(async () => {
      const result = await deleteCustomerAction(id);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        toast.success('Cliente removido. Os projetos dele ficam sem vínculo.');
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente"
          className="max-w-sm"
        />
        <Button
          className="ml-auto"
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Novo cliente
        </Button>
      </div>
      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum cliente cadastrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((item) => {
            const linked = projects.filter((project) => project.customerId === item.id);
            const active = linked.filter((project) => project.status === 'ACTIVE');
            return (
              <Card key={item.id}>
                <CardContent className="flex gap-4 p-4">
                  <span
                    className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                        {CLIENT_STATUS_LABEL[item.status]}
                      </span>
                      {active.length > 0 && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-400">
                          {active.length} projeto{active.length === 1 ? '' : 's'} ativo
                          {active.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {[item.company, item.email, item.phone].filter(Boolean).join(' · ') ||
                        'Sem contato'}
                    </p>
                    {linked.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {linked.map((project) => (
                          <li key={project.id}>
                            {project.name} · {PROJECT_STATUS_LABEL[project.status]}
                            {project.serverName ? ` · ${project.serverName}` : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.notes && <p className="text-sm text-muted-foreground">{item.notes}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditing(item);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      disabled={pendingId === item.id}
                      onClick={() => handleDelete(item.id)}
                    >
                      {pendingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <ClientDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={handleSaved} />
    </div>
  );
}
