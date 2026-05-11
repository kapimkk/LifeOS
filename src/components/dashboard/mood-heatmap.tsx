'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SerializedMoodLog } from '@/types/life-balance';
import { MOODS } from './mood-tracker';

// ─── Mood → display ───────────────────────────────────────────────────────────

const MOOD_CELL: Record<string, { bg: string; label: string; emoji: string }> = {
  awful: { bg: 'bg-red-500/80', label: 'Péssimo', emoji: '😫' },
  bad: { bg: 'bg-orange-400/80', label: 'Ruim', emoji: '😐' },
  okay: { bg: 'bg-yellow-400/80', label: 'Ok', emoji: '🙂' },
  good: { bg: 'bg-emerald-400/80', label: 'Bem', emoji: '😊' },
  great: { bg: 'bg-violet-400/80', label: 'Ótimo', emoji: '🤩' },
};

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];
const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// ─── Build calendar grid ──────────────────────────────────────────────────────

function buildGrid(logs: SerializedMoodLog[]) {
  const byDate: Record<string, string> = {};
  for (const log of logs) {
    const key = log.date.slice(0, 10); // YYYY-MM-DD
    byDate[key] = log.mood;
  }

  const today = new Date();
  // Start from 52 weeks ago (Sunday)
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  // Align to previous Sunday
  start.setDate(start.getDate() - start.getDay());

  const weeks: { date: string; mood: string | null }[][] = [];
  let current = new Date(start);

  while (current <= today) {
    const week: { date: string; mood: string | null }[] = [];
    for (let d = 0; d < 7; d++) {
      const key = current.toISOString().slice(0, 10);
      const isFuture = current > today;
      week.push({ date: key, mood: isFuture ? null : (byDate[key] ?? null) });
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, start };
}

// ─── Month label positions ────────────────────────────────────────────────────

function getMonthPositions(weeks: { date: string }[][]) {
  const positions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const date = new Date(week[0]!.date + 'T12:00:00Z');
    const month = date.getUTCMonth();
    if (month !== lastMonth) {
      positions.push({ label: MONTH_LABELS[month]!, col });
      lastMonth = month;
    }
  });
  return positions;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  logs: SerializedMoodLog[];
}

export function MoodHeatmap({ logs }: Props) {
  const { weeks } = useMemo(() => buildGrid(logs), [logs]);
  const monthPositions = useMemo(() => getMonthPositions(weeks), [weeks]);

  const totalDays = logs.length;
  const moodCounts = MOODS.map((m) => ({
    ...m,
    count: logs.filter((l) => l.mood === m.key).length,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">Clima Emocional do Ano</CardTitle>
          <span className="text-xs text-muted-foreground">{totalDays} dias registrados</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Month labels */}
            <div className="relative mb-1 ml-6 flex" style={{ height: 14 }}>
              {monthPositions.map(({ label, col }) => (
                <span
                  key={`${label}-${col}`}
                  className="absolute text-[10px] text-muted-foreground"
                  style={{ left: col * 13 }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex gap-0.5">
              {/* Day-of-week labels */}
              <div className="mr-1 flex flex-col gap-0.5">
                {DAY_LABELS.map((d, i) => (
                  <span
                    key={i}
                    className="flex h-[11px] w-4 items-center text-[9px] text-muted-foreground/60"
                  >
                    {i % 2 === 1 ? d : ''}
                  </span>
                ))}
              </div>

              {/* Week columns */}
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map(({ date, mood }) => {
                    const config = mood ? MOOD_CELL[mood] : null;
                    const label = date.slice(5).replace('-', '/');
                    return (
                      <div
                        key={date}
                        title={config ? `${label} — ${config.emoji} ${config.label}` : label}
                        className={cn(
                          'h-[11px] w-[11px] rounded-[2px] transition-all duration-100',
                          config ? config.bg : 'bg-muted/40',
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] text-muted-foreground">Humor:</span>
          {MOODS.map((m) => {
            const cfg = MOOD_CELL[m.key]!;
            const count = moodCounts.find((mc) => mc.key === m.key)?.count ?? 0;
            return (
              <div key={m.key} className="flex items-center gap-1">
                <div className={cn('h-2.5 w-2.5 rounded-[2px]', cfg.bg)} />
                <span className="text-[10px] text-muted-foreground">
                  {cfg.emoji} {count}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-[2px] bg-muted/40" />
            <span className="text-[10px] text-muted-foreground">Sem registro</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
