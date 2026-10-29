'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ServerDialog } from './server-dialog';
import { PROJECT_STATUS_LABEL, SERVER_STATUS_LABEL } from '../labels';
import { ListPagination, filterSelectClass, paginate } from '../list-controls';
import { deleteVpsAction } from '@/modules/gestao/interfaces/actions';
import type { SerializedProject, SerializedVps } from '@/modules/gestao/domain/entities';
import type { ServerStatus } from '@/lib/validators/gestao';
import { formatCurrency } from '@/lib/utils';

interface Props {
  initialServers: SerializedVps[];
  projects: SerializedProject[];
  currency: string;
}

export function ServersSection({ initialServers, projects, currency }: Props) {
  const [items, setItems] = useState(initialServers);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ServerStatus | 'ALL'>('ALL');
  const [hosting, setHosting] = useState<'ALL' | 'WITH' | 'WITHOUT'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SerializedVps | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== 'ALL' && item.status !== status) return false;
      const hosted = projects.some((project) => project.serverId === item.id);
      if (hosting === 'WITH' && !hosted) return false;
      if (hosting === 'WITHOUT' && hosted) return false;
      if (!term) return true;
      return [item.name, item.provider, item.ipAddress, item.hostname, item.region]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [items, projects, query, status, hosting]);

  const pageState = paginate(filtered, page, pageSize);

  useEffect(() => {
    if (page !== pageState.current) setPage(pageState.current);
  }, [page, pageState.current]);

  const filtersActive = query.trim() !== '' || status !== 'ALL' || hosting !== 'ALL';

  function handleSaved(item: SerializedVps) {
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
      const result = await deleteVpsAction(id);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        toast.success('Servidor removido. Os projetos ficam sem VPS.');
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
          placeholder="Buscar servidor, IP ou provedor"
          className="max-w-sm"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ServerStatus | 'ALL');
            setPage(1);
          }}
          className={filterSelectClass}
          aria-label="Filtrar por status"
        >
          <option value="ALL">Todos os status</option>
          {(Object.keys(SERVER_STATUS_LABEL) as ServerStatus[]).map((item) => (
            <option key={item} value={item}>
              {SERVER_STATUS_LABEL[item]}
            </option>
          ))}
        </select>
        <select
          value={hosting}
          onChange={(event) => {
            setHosting(event.target.value as 'ALL' | 'WITH' | 'WITHOUT');
            setPage(1);
          }}
          className={filterSelectClass}
          aria-label="Filtrar por projetos hospedados"
        >
          <option value="ALL">Com ou sem projeto</option>
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
              setHosting('ALL');
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
          Nova VPS
        </Button>
      </div>
      {pageState.total === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {filtersActive ? 'Nenhum servidor para esses filtros.' : 'Nenhum servidor cadastrado.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {pageState.slice.map((item) => {
            const hosted = projects.filter((project) => project.serverId === item.id);
            const specs = [
              item.cpu,
              item.ramGb ? `${item.ramGb} GB RAM` : null,
              item.diskGb ? `${item.diskGb} GB` : null,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <Card key={item.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex gap-4">
                    <span
                      className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                          {SERVER_STATUS_LABEL[item.status]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {[item.provider, item.ipAddress, item.operatingSystem, item.region]
                          .filter(Boolean)
                          .join(' · ') || 'Sem detalhes de rede'}
                      </p>
                      {specs && <p className="text-sm text-muted-foreground">{specs}</p>}
                      {item.monthlyCost != null && (
                        <p className="text-sm">
                          {formatCurrency(item.monthlyCost, currency)} / mês
                        </p>
                      )}
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
                  </div>
                  {hosted.length > 0 && (
                    <div className="text-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Projetos neste servidor
                      </p>
                      <ul className="mt-1 space-y-1">
                        {hosted.map((project) => (
                          <li key={project.id}>
                            {project.name} · {PROJECT_STATUS_LABEL[project.status]}
                            {project.customerName ? ` · ${project.customerName}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.backupNotes && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Backups: </span>
                      {item.backupNotes}
                    </p>
                  )}
                  {item.folderStructure && (
                    <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-xs">
                      {item.folderStructure}
                    </pre>
                  )}
                  {item.hostedNotes && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Hospedado: </span>
                      {item.hostedNotes}
                    </p>
                  )}
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
      <ServerDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={handleSaved} />
    </div>
  );
}
