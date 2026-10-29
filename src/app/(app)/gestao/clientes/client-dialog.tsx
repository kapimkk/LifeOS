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
import { CLIENT_STATUS_LABEL } from '../labels';
import { createCustomerAction, updateCustomerAction } from '@/modules/gestao/interfaces/actions';
import type { SerializedCustomer } from '@/modules/gestao/domain/entities';
import type { ClientStatus } from '@/lib/validators/gestao';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SerializedCustomer | null;
  onSaved: (item: SerializedCustomer) => void;
}

const STATUSES = Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[];

export function ClientDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<ClientStatus>('ACTIVE');
  const [color, setColor] = useState('#6366f1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setCompany(editing?.company ?? '');
    setEmail(editing?.email ?? '');
    setPhone(editing?.phone ?? '');
    setWebsite(editing?.website ?? '');
    setStatus(editing?.status ?? 'ACTIVE');
    setColor(editing?.color ?? '#6366f1');
    setNotes(editing?.notes ?? '');
  }, [open, editing]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const payload = { name, company, email, phone, website, status, color, notes };
      const result = editing
        ? await updateCustomerAction(editing.id, payload)
        : await createCustomerAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? 'Cliente atualizado' : 'Cliente criado');
      onSaved(result.data);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
          <DialogDescription>Dados de contato e o status da relação.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="cli-name">Nome</Label>
            <Input id="cli-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cli-company">Empresa</Label>
              <Input
                id="cli-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ClientStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {CLIENT_STATUS_LABEL[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cli-email">E-mail</Label>
              <Input id="cli-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cli-phone">Telefone</Label>
              <Input id="cli-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cli-site">Site</Label>
            <Input
              id="cli-site"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cli-notes">Notas</Label>
            <Textarea
              id="cli-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
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
