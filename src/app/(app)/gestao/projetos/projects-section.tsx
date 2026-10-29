'use client';

import { useMemo, useState, useTransition } from 'react';
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProjectDialog } from './project-dialog';
import { PROJECT_STATUS_LABEL } from '../labels';
import { deleteProjectAction } from '@/modules/gestao/interfaces/actions';
import type {
  SerializedCustomer,
  SerializedProject,
  SerializedVps,
} from '@/modules/gestao/domain/entities';
import type { ProjectStatus } from '@/lib/validators/gestao';

interface Props {
  initialProjects: SerializedProject[];
  customers: SerializedCustomer[];
  servers: SerializedVps[];
}

export function ProjectsSection({ initialProjects, customers, servers }: Props) {
  const [items, setItems] = useState(initialProjects);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'ALL'>('ALL');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SerializedProject | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== 'ALL' && item.status !== status) return false;
      if (!term) return true;
      return [item.name, item.summary, item.customerName, item.serverName, item.stack.join(' ')]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [items, query, status]);

  function handleSaved(item: SerializedProject) {
    setItems((prev) => {
      const exists = prev.some((current) => current.id === item.id);
      return exists
        ? prev.map((current) => (current.id === item.id ? item : current))
        : [item, ...prev];
    });
  }

  function handleDelete(id: string) {
    const previous = items;
    setPendingId(id);
    setItems(items.filter((item) => item.id !== id));
    startTransition(async () => {
      const result = await deleteProjectAction(id);
      if (!result.success) {
        setItems(previous);
        toast.error(result.error);
      } else {
        toast.success('Projeto removido');
      }
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar projeto, cliente ou stack"
          className="max-w-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ProjectStatus | 'ALL')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">Todos os status</option>
          {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map((item) => (
            <option key={item} value={item}>
              {PROJECT_STATUS_LABEL[item]}
            </option>
          ))}
        </select>
        <Button
          className="ml-auto"
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Novo projeto
        </Button>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum projeto aqui. Crie o primeiro e vincule cliente e servidor se quiser.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="flex gap-4 p-4">
                <span
                  className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                      {PROJECT_STATUS_LABEL[item.status]}
                    </span>
                  </div>
                  {item.summary && <p className="text-sm text-muted-foreground">{item.summary}</p>}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Cliente: {item.customerName ?? '—'}</span>
                    <span>VPS: {item.serverName ?? '—'}</span>
                  </div>
                  {item.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.stack.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-border px-1.5 py-0.5 text-[11px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.specification && (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {item.specification}
                    </p>
                  )}
                  <div className="flex gap-3 text-xs">
                    {item.liveUrl && (
                      <a
                        className="inline-flex items-center gap-1 text-primary"
                        href={item.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Site <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {item.repoUrl && (
                      <a
                        className="inline-flex items-center gap-1 text-primary"
                        href={item.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Repo <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
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
          ))}
        </div>
      )}

      <ProjectDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        customers={customers}
        servers={servers}
        onSaved={handleSaved}
      />
    </div>
  );
}
