'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, ListChecks, Plus, Settings2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { cn } from '@/lib/utils';
import { WEEK_DAYS, WEEK_DAY_LABELS, WEEK_DAY_SHORT, type WeekDay } from '@/lib/validators/routine';
import type { SerializedRoutineItem } from '@/modules/routine/domain/entities';
import { RoutineDialog } from './routine-dialog';
import { RoutineSettingsDialog } from './routine-settings-dialog';
import {
  DEFAULT_ROUTINE_VIEW,
  ROW_HEIGHT_BY_DENSITY,
  readRoutineViewSettings,
  saveRoutineViewSettings,
  type RoutineViewSettings,
} from './routine-view-settings';

// JS Date#getDay(): 0=domingo..6=sábado. Mapeia para nossos dias (seg-dom).
const JS_DAY_TO_WEEK_DAY: WeekDay[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

interface LaidOutItem extends SerializedRoutineItem {
  lane: number;
  lanes: number;
}

/** Layout de blocos que se sobrepõem no tempo (mesmo dia): cada item recebe
 * uma "faixa" (lane); itens no mesmo cluster dividem a largura da coluna. */
function layoutDayItems(items: SerializedRoutineItem[]): LaidOutItem[] {
  const sorted = [...items].sort(
    (a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute,
  );
  const result: LaidOutItem[] = [];
  let cluster: LaidOutItem[] = [];
  let clusterEnd = -1;

  function flushCluster() {
    if (cluster.length === 0) return;
    const laneEnds: number[] = [];
    for (const item of cluster) {
      let lane = laneEnds.findIndex((end) => end <= item.startMinute);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(item.endMinute);
      } else {
        laneEnds[lane] = item.endMinute;
      }
      item.lane = lane;
    }
    const lanes = laneEnds.length;
    for (const item of cluster) item.lanes = lanes;
    result.push(...cluster);
    cluster = [];
  }

  for (const item of sorted) {
    if (cluster.length > 0 && item.startMinute >= clusterEnd) {
      flushCluster();
      clusterEnd = -1;
    }
    cluster.push({ ...item, lane: 0, lanes: 1 });
    clusterEnd = Math.max(clusterEnd, item.endMinute);
  }
  flushCluster();
  return result;
}

function formatHour(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

function durationLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function hourBoundaryLabel(h: number) {
  return h >= 24 ? '24:00' : `${String(h).padStart(2, '0')}:00`;
}

export function RoutineClient({ initialItems }: { initialItems: SerializedRoutineItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<SerializedRoutineItem | null>(null);
  const [dialogDay, setDialogDay] = useState<WeekDay>('MONDAY');
  const [dialogStart, setDialogStart] = useState<number | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState<RoutineViewSettings>(DEFAULT_ROUTINE_VIEW);

  // Carrega a preferência salva neste dispositivo depois de montar (evita
  // mismatch de hidratação — o servidor não tem acesso ao localStorage).
  useEffect(() => {
    setView(readRoutineViewSettings());
  }, []);

  function handleViewChange(next: RoutineViewSettings) {
    setView(next);
    saveRoutineViewSettings(next);
  }

  const rowHeight = ROW_HEIGHT_BY_DENSITY[view.density];
  const { startHour, endHour } = view;
  const totalHours = endHour - startHour;
  const gridHeight = totalHours * rowHeight;
  const visibleStartMinute = startHour * 60;
  const visibleEndMinute = endHour * 60;

  const displayDays = useMemo(
    () => (view.weekStart === 'SUNDAY' ? [WEEK_DAYS[6], ...WEEK_DAYS.slice(0, 6)] : WEEK_DAYS),
    [view.weekStart],
  );

  const todayWeekDay = useMemo(() => JS_DAY_TO_WEEK_DAY[new Date().getDay()], []);
  const nowMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const itemsByDay = useMemo(() => {
    const map = new Map<WeekDay, SerializedRoutineItem[]>();
    for (const day of WEEK_DAYS) map.set(day, []);
    for (const item of items) map.get(item.day)?.push(item);
    return map;
  }, [items]);

  const stats = useMemo(() => {
    const totalMinutes = items.reduce((acc, i) => acc + (i.endMinute - i.startMinute), 0);
    const categories = new Set(items.map((i) => i.category));
    let busiestDay: WeekDay | null = null;
    let busiestMinutes = 0;
    for (const day of WEEK_DAYS) {
      const dayMinutes = (itemsByDay.get(day) ?? []).reduce(
        (acc, i) => acc + (i.endMinute - i.startMinute),
        0,
      );
      if (dayMinutes > busiestMinutes) {
        busiestMinutes = dayMinutes;
        busiestDay = day;
      }
    }
    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      itemCount: items.length,
      categoryCount: categories.size,
      busiestDay,
    };
  }, [items, itemsByDay]);

  function openAddDialog(day: WeekDay, startMinute?: number) {
    setEditing(null);
    setDialogDay(day);
    setDialogStart(startMinute);
    setOpenDialog(true);
  }

  function openEditDialog(item: SerializedRoutineItem) {
    setEditing(item);
    setDialogDay(item.day);
    setDialogStart(undefined);
    setOpenDialog(true);
  }

  function handleSaved(item: SerializedRoutineItem) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) return prev.map((i) => (i.id === item.id ? item : i));
      return [...prev, item];
    });
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleColumnClick(day: WeekDay, e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return; // clique em um bloco, não no fundo
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const rawMinute = Math.round((offsetY / rowHeight) * 60) + visibleStartMinute;
    const snapped = Math.max(
      visibleStartMinute,
      Math.min(visibleEndMinute - 30, Math.round(rawMinute / 30) * 30),
    );
    openAddDialog(day, snapped);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Horas planejadas / semana"
          value={`${stats.totalHours}h`}
          icon={<Clock />}
          accent="primary"
        />
        <StatCard
          label="Itens na rotina"
          value={String(stats.itemCount)}
          icon={<ListChecks />}
          accent="info"
        />
        <StatCard
          label="Dia mais cheio"
          value={stats.busiestDay ? WEEK_DAY_LABELS[stats.busiestDay] : '—'}
          icon={<Sparkles />}
          accent="warning"
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Configurar grade
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              {/* Cabeçalho: dias da semana */}
              <div
                className="sticky top-0 z-10 grid border-b border-border/60 bg-card"
                style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}
              >
                <div className="border-r border-border/40" />
                {displayDays.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      'flex items-center justify-between gap-1 border-r border-border/40 px-2 py-2.5 last:border-r-0',
                      day === todayWeekDay && 'bg-primary/5',
                    )}
                  >
                    <div>
                      <p
                        className={cn(
                          'text-xs font-semibold',
                          day === todayWeekDay && 'text-primary',
                        )}
                      >
                        {WEEK_DAY_SHORT[day]}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAddDialog(day)}
                      aria-label={`Adicionar em ${WEEK_DAY_LABELS[day]}`}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Corpo: linhas de hora + colunas de dia */}
              <div className="grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                <div className="relative border-r border-border/40" style={{ height: gridHeight }}>
                  {Array.from({ length: totalHours + 1 }, (_, i) => startHour + i).map((h) => (
                    <div
                      key={h}
                      className={cn(
                        'absolute inset-x-0 pr-2 text-right text-[10px] text-muted-foreground',
                        h === startHour
                          ? ''
                          : h === endHour
                            ? '-translate-y-full'
                            : '-translate-y-1/2',
                      )}
                      style={{ top: (h - startHour) * rowHeight }}
                    >
                      {hourBoundaryLabel(h)}
                    </div>
                  ))}
                </div>

                {displayDays.map((day) => {
                  const dayItems = layoutDayItems(itemsByDay.get(day) ?? []);
                  return (
                    <div
                      key={day}
                      role="presentation"
                      onClick={(e) => handleColumnClick(day, e)}
                      className={cn(
                        'relative cursor-pointer border-r border-border/40 last:border-r-0',
                        day === todayWeekDay && 'bg-primary/[0.03]',
                      )}
                      style={{ height: gridHeight }}
                    >
                      {/* Linhas de hora, incluindo a linha de fechamento no
                          final da faixa (evita o bloco "flutuar" sem borda
                          quando termina exatamente no limite exibido). */}
                      {Array.from({ length: totalHours + 1 }, (_, i) => i).map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'pointer-events-none absolute inset-x-0 border-t',
                            i === totalHours ? 'border-border/60' : 'border-border/30',
                          )}
                          style={{ top: i * rowHeight }}
                        />
                      ))}

                      {day === todayWeekDay &&
                        nowMinutes >= visibleStartMinute &&
                        nowMinutes <= visibleEndMinute && (
                          <div
                            className="pointer-events-none absolute inset-x-0 z-10 flex items-center gap-1"
                            style={{ top: ((nowMinutes - visibleStartMinute) / 60) * rowHeight }}
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                            <span className="h-px flex-1 bg-destructive/70" />
                          </div>
                        )}

                      {dayItems.map((item) => {
                        const clampedStart = Math.max(item.startMinute, visibleStartMinute);
                        const clampedEnd = Math.min(item.endMinute, visibleEndMinute);
                        if (clampedEnd <= clampedStart) return null;
                        const top = ((clampedStart - visibleStartMinute) / 60) * rowHeight;
                        const height = Math.max(
                          ((clampedEnd - clampedStart) / 60) * rowHeight - 2,
                          16,
                        );
                        const widthPct = 100 / item.lanes;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(item);
                            }}
                            className="absolute overflow-hidden rounded-md border px-1.5 py-1 text-left shadow-sm transition-all hover:z-20 hover:shadow-md"
                            style={{
                              top,
                              height,
                              left: `${item.lane * widthPct}%`,
                              width: `calc(${widthPct}% - 2px)`,
                              backgroundColor: `${item.color}26`,
                              borderColor: `${item.color}66`,
                            }}
                          >
                            <p
                              className="truncate text-[11px] font-semibold leading-tight"
                              style={{ color: item.color }}
                            >
                              {item.title}
                            </p>
                            {height > 30 && (
                              <p className="truncate text-[10px] text-muted-foreground">
                                {formatHour(item.startMinute)} ·{' '}
                                {durationLabel(item.endMinute - item.startMinute)}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Clique em um espaço vazio da grade para adicionar um item, ou no botão “+” do cabeçalho do
        dia. Clique em um item existente para editar ou excluir.
      </p>

      <RoutineDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editing={editing}
        defaultDay={dialogDay}
        defaultStartMinute={dialogStart}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />

      <RoutineSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={view}
        onChange={handleViewChange}
      />
    </div>
  );
}
