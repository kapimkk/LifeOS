'use client';

import { Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  DEFAULT_ROUTINE_VIEW,
  DENSITY_LABELS,
  ROW_HEIGHT_BY_DENSITY,
  type RoutineDensity,
  type RoutineViewSettings,
  type RoutineWeekStart,
} from './routine-view-settings';

const DENSITIES = Object.keys(ROW_HEIGHT_BY_DENSITY) as RoutineDensity[];

function hourLabel(h: number) {
  return `${String(h % 24).padStart(2, '0')}:00`;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  settings: RoutineViewSettings;
  onChange: (settings: RoutineViewSettings) => void;
}

export function RoutineSettingsDialog({ open, onOpenChange, settings, onChange }: Props) {
  function update(partial: Partial<RoutineViewSettings>) {
    const next = { ...settings, ...partial };
    if (next.endHour <= next.startHour) {
      // Mantém a faixa válida: empurra o outro limite junto.
      if (partial.startHour !== undefined) next.endHour = Math.min(24, next.startHour + 1);
      else next.startHour = Math.max(0, next.endHour - 1);
    }
    onChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações da grade</DialogTitle>
          <DialogDescription>
            Personalize como a rotina semanal aparece pra você. Fica salvo neste dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Faixa de horário exibida</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={String(settings.startHour)}
                onValueChange={(v) => update({ startHour: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, h) => h).map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {hourLabel(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(settings.endHour)}
                onValueChange={(v) => update({ endHour: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {h === 24 ? '24:00' : hourLabel(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Esconda horas que você nunca usa (ex.: madrugada) pra deixar a grade mais compacta.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Densidade</Label>
            <div className="grid grid-cols-3 gap-2">
              {DENSITIES.map((d) => {
                const active = settings.density === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update({ density: d })}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-colors',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border/60 hover:border-border',
                    )}
                    aria-pressed={active}
                  >
                    <span className="text-xs font-medium">{DENSITY_LABELS[d]}</span>
                    {active && <Check className="h-3 w-3 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Primeiro dia da semana</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['MONDAY', 'SUNDAY'] as RoutineWeekStart[]).map((w) => {
                const active = settings.weekStart === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => update({ weekStart: w })}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-center text-xs font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border/60 hover:border-border',
                    )}
                    aria-pressed={active}
                  >
                    {w === 'MONDAY' ? 'Segunda-feira' : 'Domingo'}
                    {active && <Check className="h-3 w-3 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="gap-1.5 text-muted-foreground"
            onClick={() => onChange(DEFAULT_ROUTINE_VIEW)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar padrão
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
