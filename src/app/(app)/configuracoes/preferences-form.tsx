'use client';

import { useState, useTransition } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiFetch } from '@/lib/fetcher';

interface Defaults {
  theme: 'dark' | 'light' | 'system';
  weeklyDigest: boolean;
  emailReminders: boolean;
  pushReminders: boolean;
}

export function PreferencesForm({ defaults }: { defaults: Defaults }) {
  const [prefs, setPrefs] = useState(defaults);
  const { setTheme } = useTheme();
  const [, startTransition] = useTransition();

  function update<K extends keyof Defaults>(key: K, value: Defaults[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (key === 'theme') setTheme(value as string);
    startTransition(async () => {
      try {
        await apiFetch('/api/me/preferences', {
          method: 'PATCH',
          body: JSON.stringify({ [key]: value }),
        });
        toast.success('Preferências atualizadas');
      } catch {
        toast.error('Erro ao salvar');
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Tema</Label>
          <p className="text-xs text-muted-foreground">Escolha como o LifeOS deve aparecer</p>
        </div>
        <Select
          value={prefs.theme}
          onValueChange={(v) => update('theme', v as Defaults['theme'])}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">Escuro</SelectItem>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Resumo semanal</Label>
          <p className="text-xs text-muted-foreground">
            Receba um resumo da sua semana toda segunda-feira
          </p>
        </div>
        <Switch
          checked={prefs.weeklyDigest}
          onCheckedChange={(v) => update('weeklyDigest', v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Lembretes por e-mail</Label>
          <p className="text-xs text-muted-foreground">
            Notificações sobre hábitos, metas e tarefas
          </p>
        </div>
        <Switch
          checked={prefs.emailReminders}
          onCheckedChange={(v) => update('emailReminders', v)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Lembretes push</Label>
          <p className="text-xs text-muted-foreground">Avisos no navegador</p>
        </div>
        <Switch
          checked={prefs.pushReminders}
          onCheckedChange={(v) => update('pushReminders', v)}
        />
      </div>
    </div>
  );
}
