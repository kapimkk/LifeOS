'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ClientDialog } from './client-dialog';
import { CLIENT_STATUS_LABEL, PROJECT_STATUS_LABEL } from '../labels';
import { ListPagination, filterSelectClass, paginate } from '../list-controls';
import { deleteCustomerAction } from '@/modules/gestao/interfaces/actions';
import type { SerializedCustomer, SerializedProject } from '@/modules/gestao/domain/entities';
import type { ClientStatus } from '@/lib/validators/gestao';

interface Props {
  initialCustomers: SerializedCustomer[];
  projects: SerializedProject[];
}

export function ClientsSection({ initialCustomers, projects }: Props) {
  const [items, setItems] = useState(initialCustomers);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ClientStatus | 'ALL'>('ALL');
  const [link, setLink] = useState<'ALL' | 'WITH' | 'ACTIVE' | 'WITHOUT'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SerializedCustomer | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== 'ALL' && item.status !== status) return false;
      const linked = projects.filter((project) => project.customerId === item.id);
      const active = linked.some((project) => project.status === 'ACTIVE');
      if (link === 'WITH' && linked.length === 0) return false;
      if (link === 'ACTIVE' && !active) return false;
      if (link === 'WITHOUT' && linked.length > 0) return false;
      if (!term) return true;
      return [item.name, item.company, item.email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [items, projects, query, status, link]);

  const pageState = paginate(filtered, page, pageSize);

  useEffect(() => {
    if (page !== pageState.current) setPage(pageState.current);
  }, [page, pageState.current]);

  const filtersActive = query.trim() !== '' || status !== 'ALL' || link !== 'ALL';

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
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar cliente"
          className="max-w-sm"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ClientStatus | 'ALL');
            setPage(1);
          }}
          className={filterSelectClass}
          aria-label="Filtrar por status"
        >
          <option value="ALL">Todos os status</option>
          {(Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[]).map((item) => (
            <option key={item} value={item}>
              {CLIENT_STATUS_LABEL[item]}
            </option>
          ))}
        </select>
        <select
          value={link}
          onChange={(event) => {
            setLink(event.target.value as 'ALL' | 'WITH' | 'ACTIVE' | 'WITHOUT');
            setPage(1);
          }}
          className={filterSelectClass}
          aria-label="Filtrar por projeto"
        >
          <option value="ALL">Todos os vínculos</option>
          <option value="ACTIVE">Com projeto ativo</option>
          <option value="WITH">Com projeto</option>
          <option value="WITHOUT">Sem projeto</option>
        </select>
        {filtersActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setStatus('ALL');
              setLink('ALL');
              setPage(1);
            }}
          >
            Limpar filtros
          </Button>
        )}
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
      {pageState.total === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {filtersActive ? 'Nenhum cliente para esses filtros.' : 'Nenhum cliente cadastrado.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pageState.slice.map((item) => {
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
      <ListPagination
        page={pageState.current}
        pages={pageState.pages}
        total={pageState.total}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
      <ClientDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={handleSaved} />
    </div>
  );
}
