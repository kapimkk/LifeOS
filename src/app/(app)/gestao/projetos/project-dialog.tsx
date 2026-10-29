'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '../color-picker';
import { PROJECT_STATUS_LABEL } from '../labels';
import { createProjectAction, updateProjectAction } from '@/modules/gestao/interfaces/actions';
import type {
  SerializedCustomer,
  SerializedProject,
  SerializedVps,
} from '@/modules/gestao/domain/entities';
import type { ProjectStatus } from '@/lib/validators/gestao';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SerializedProject | null;
  customers: SerializedCustomer[];
  servers: SerializedVps[];
  onSaved: (item: SerializedProject) => void;
}

const STATUSES = Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[];

export function ProjectDialog({ open, onOpenChange, editing, customers, servers, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [specification, setSpecification] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [color, setColor] = useState('#22c55e');
  const [customerId, setCustomerId] = useState('none');
  const [serverId, setServerId] = useState('none');
  const [stackText, setStackText] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setSummary(editing?.summary ?? '');
    setSpecification(editing?.specification ?? '');
    setStatus(editing?.status ?? 'ACTIVE');
    setColor(editing?.color ?? '#22c55e');
    setCustomerId(editing?.customerId ?? 'none');
    setServerId(editing?.serverId ?? 'none');
    setStackText(editing?.stack.join(', ') ?? '');
    setRepoUrl(editing?.repoUrl ?? '');
    setLiveUrl(editing?.liveUrl ?? '');
    setNotes(editing?.notes ?? '');
  }, [open, editing]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const stack = stackText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
    startTransition(async () => {
      const payload = {
        name,
        summary,
        specification,
        status,
        color,
        customerId: customerId === 'none' ? null : customerId,
        serverId: serverId === 'none' ? null : serverId,
        stack,
        repoUrl,
        liveUrl,
        notes,
      };
      const result = editing
        ? await updateProjectAction(editing.id, payload)
        : await createProjectAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Projeto atualizado' : 'Projeto criado');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar projeto' : 'Novo projeto'}</DialogTitle>
          <DialogDescription>
            Descreva o que é, e vincule a um cliente e a uma VPS quando fizer sentido.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="proj-name">Nome</Label>
            <Input id="proj-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {PROJECT_STATUS_LABEL[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem cliente</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>VPS</Label>
              <Select value={serverId} onValueChange={setServerId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem servidor</SelectItem>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj-summary">O que é</Label>
            <Input
              id="proj-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Uma linha sobre o projeto"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj-spec">Especificação</Label>
            <Textarea
              id="proj-spec"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              placeholder="Escopo, entregas, o que está no ar..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj-stack">Stack</Label>
            <Input
              id="proj-stack"
              value={stackText}
              onChange={(e) => setStackText(e.target.value)}
              placeholder="Next.js, Postgres, Docker"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="proj-live">URL</Label>
              <Input
                id="proj-live"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proj-repo">Repositório</Label>
              <Input
                id="proj-repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj-notes">Notas</Label>
            <Textarea
              id="proj-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
