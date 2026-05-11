'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { saveMoodAction, type SerializedMoodLog } from '@/server/actions/life-balance-actions';

// ─── Mood config ──────────────────────────────────────────────────────────────

export const MOODS = [
  { key: 'awful', emoji: '😫', label: 'Péssimo',   color: 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30',      activeColor: 'bg-red-500/30 border-red-500 ring-2 ring-red-500/40' },
  { key: 'bad',   emoji: '😐', label: 'Ruim',      color: 'bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30', activeColor: 'bg-orange-500/30 border-orange-500 ring-2 ring-orange-500/40' },
  { key: 'okay',  emoji: '🙂', label: 'Ok',         color: 'bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30', activeColor: 'bg-yellow-500/30 border-yellow-500 ring-2 ring-yellow-500/40' },
  { key: 'good',  emoji: '😊', label: 'Bem',        color: 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30', activeColor: 'bg-emerald-500/30 border-emerald-500 ring-2 ring-emerald-500/40' },
  { key: 'great', emoji: '🤩', label: 'Ótimo!',    color: 'bg-violet-500/20 border-violet-500/40 hover:bg-violet-500/30', activeColor: 'bg-violet-500/30 border-violet-500 ring-2 ring-violet-500/40' },
] as const;

export type MoodKey = (typeof MOODS)[number]['key'];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  todayMood: SerializedMoodLog | null;
}

export function MoodTracker({ todayMood }: Props) {
  const [selected, setSelected] = useState<MoodKey | null>(
    (todayMood?.mood as MoodKey) ?? null,
  );
  const [isPending, startTransition] = useTransition();

  function handleSelect(mood: MoodKey) {
    setSelected(mood);
    startTransition(async () => {
      const res = await saveMoodAction({ mood });
      if (res.success) {
        const moodLabel = MOODS.find((m) => m.key === mood)?.label ?? '';
        toast.success(`Humor registrado: ${moodLabel}`);
      } else {
        toast.error(res.error);
        setSelected((todayMood?.mood as MoodKey) ?? null);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          Como você se sente hoje?
          {selected && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {todayMood ? 'Atualizado' : 'Salvo'} ✓
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {MOODS.map((mood, i) => (
            <motion.button
              key={mood.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(mood.key)}
              disabled={isPending}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-1 py-3 transition-all duration-150',
                selected === mood.key ? mood.activeColor : mood.color,
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
              title={mood.label}
            >
              {isPending && selected === mood.key ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-2xl leading-none">{mood.emoji}</span>
              )}
              <span className="text-[10px] font-medium text-muted-foreground">{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
