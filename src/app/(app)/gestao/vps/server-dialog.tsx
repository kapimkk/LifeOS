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
import { SERVER_STATUS_LABEL } from '../labels';
import { createVpsAction, updateVpsAction } from '@/modules/gestao/interfaces/actions';
import type { SerializedVps } from '@/modules/gestao/domain/entities';
import type { ServerStatus } from '@/lib/validators/gestao';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SerializedVps | null;
  onSaved: (item: SerializedVps) => void;
}

const STATUSES = Object.keys(SERVER_STATUS_LABEL) as ServerStatus[];

export function ServerDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [hostname, setHostname] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [region, setRegion] = useState('');
  const [cpu, setCpu] = useState('');
  const [ramGb, setRamGb] = useState('');
  const [diskGb, setDiskGb] = useState('');
  const [status, setStatus] = useState<ServerStatus>('ONLINE');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [panelUrl, setPanelUrl] = useState('');
  const [color, setColor] = useState('#0ea5e9');
  const [backupNotes, setBackupNotes] = useState('');
  const [folderStructure, setFolderStructure] = useState('');
  const [hostedNotes, setHostedNotes] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setProvider(editing?.provider ?? '');
    setHostname(editing?.hostname ?? '');
    setIpAddress(editing?.ipAddress ?? '');
    setOperatingSystem(editing?.operatingSystem ?? '');
    setRegion(editing?.region ?? '');
    setCpu(editing?.cpu ?? '');
    setRamGb(editing?.ramGb?.toString() ?? '');
    setDiskGb(editing?.diskGb?.toString() ?? '');
    setStatus(editing?.status ?? 'ONLINE');
    setMonthlyCost(editing?.monthlyCost?.toString() ?? '');
    setPanelUrl(editing?.panelUrl ?? '');
    setColor(editing?.color ?? '#0ea5e9');
    setBackupNotes(editing?.backupNotes ?? '');
    setFolderStructure(editing?.folderStructure ?? '');
    setHostedNotes(editing?.hostedNotes ?? '');
    setNotes(editing?.notes ?? '');
  }, [open, editing]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        name,
        provider,
        hostname,
        ipAddress,
        operatingSystem,
        region,
        cpu,
        ramGb: ramGb === '' ? null : Number(ramGb),
        diskGb: diskGb === '' ? null : Number(diskGb),
        status,
        monthlyCost: monthlyCost === '' ? null : Number(monthlyCost),
        panelUrl,
        color,
        backupNotes,
        folderStructure,
        hostedNotes,
        notes,
      };
      const result = editing
        ? await updateVpsAction(editing.id, payload)
        : await createVpsAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Servidor atualizado' : 'Servidor criado');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar VPS' : 'Nova VPS'}</DialogTitle>
          <DialogDescription>
            Inventário do servidor. Não salve senhas, chaves SSH ou tokens aqui.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vps-name">Nome</Label>
              <Input
                id="vps-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vps-provider">Provedor</Label>
              <Input
                id="vps-provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Hetzner, Contabo..."
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ServerStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {SERVER_STATUS_LABEL[item]}
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
              <Label htmlFor="vps-host">Hostname</Label>
              <Input id="vps-host" value={hostname} onChange={(e) => setHostname(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vps-ip">IP</Label>
              <Input id="vps-ip" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vps-os">Sistema</Label>
              <Input
                id="vps-os"
                value={operatingSystem}
                onChange={(e) => setOperatingSystem(e.target.value)}
                placeholder="Ubuntu 24.04"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vps-region">Região</Label>
              <Input id="vps-region" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="vps-cpu">CPU</Label>
              <Input
                id="vps-cpu"
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                placeholder="4 vCPU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vps-ram">RAM (GB)</Label>
              <Input
                id="vps-ram"
                type="number"
                min="1"
                value={ramGb}
                onChange={(e) => setRamGb(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vps-disk">Disco (GB)</Label>
              <Input
                id="vps-disk"
                type="number"
                min="1"
                value={diskGb}
                onChange={(e) => setDiskGb(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vps-cost">Custo mensal</Label>
              <Input
                id="vps-cost"
                type="number"
                min="0"
                step="0.01"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vps-panel">Painel</Label>
              <Input
                id="vps-panel"
                value={panelUrl}
                onChange={(e) => setPanelUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vps-backup">Backups</Label>
            <Textarea
              id="vps-backup"
              value={backupNotes}
              onChange={(e) => setBackupNotes(e.target.value)}
              rows={3}
              placeholder="Frequência, destino, última verificação"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vps-folders">Estrutura de pastas</Label>
            <Textarea
              id="vps-folders"
              className="font-mono text-xs"
              value={folderStructure}
              onChange={(e) => setFolderStructure(e.target.value)}
              rows={4}
              placeholder={'/var/www\n/opt/backups'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vps-hosted">O que está hospedado</Label>
            <Textarea
              id="vps-hosted"
              value={hostedNotes}
              onChange={(e) => setHostedNotes(e.target.value)}
              rows={3}
              placeholder="Sites, bancos, filas, além dos projetos vinculados"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vps-notes">Notas</Label>
            <Textarea
              id="vps-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
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
