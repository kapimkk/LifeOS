'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { AlertCircle, Loader2, Save, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  saveLifeBalanceAction,
  type LifeBalanceInput,
  type SerializedLifeBalance,
} from '@/server/actions/life-balance-actions';

// ─── Config ───────────────────────────────────────────────────────────────────

type BalanceKey = keyof Omit<LifeBalanceInput, 'notes'>;

const CATEGORIES: {
  key: BalanceKey;
  label: string;
  emoji: string;
  goalCategory: string;
  color: string;
}[] = [
  { key: 'saude',           label: 'Saúde',                emoji: '🏃',  goalCategory: 'FITNESS',   color: '#22c55e' },
  { key: 'carreira',        label: 'Carreira',             emoji: '💼',  goalCategory: 'CAREER',    color: '#6366f1' },
  { key: 'financas',        label: 'Finanças',             emoji: '💰',  goalCategory: 'FINANCIAL', color: '#f59e0b' },
  { key: 'relacionamentos', label: 'Relacionamentos',      emoji: '❤️',  goalCategory: 'PERSONAL',  color: '#ec4899' },
  { key: 'lazer',           label: 'Lazer',                emoji: '🎯',  goalCategory: 'PERSONAL',  color: '#14b8a6' },
  { key: 'pessoal',         label: 'Desenvolvimento Pessoal', emoji: '🌱', goalCategory: 'PERSONAL', color: '#8b5cf6' },
  { key: 'espiritualidade', label: 'Espiritualidade',      emoji: '✨',  goalCategory: 'PERSONAL',  color: '#f97316' },
  { key: 'contribuicao',    label: 'Contribuição',         emoji: '🤝',  goalCategory: 'PERSONAL',  color: '#06b6d4' },
];

const DEFAULT_VALUES: LifeBalanceInput = {
  saude: 5, carreira: 5, financas: 5, relacionamentos: 5,
  lazer: 5, pessoal: 5, espiritualidade: 5, contribuicao: 5,
  notes: null,
};

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreLabel({ value }: { value: number }) {
  const color =
    value >= 8 ? 'text-emerald-400' :
    value >= 6 ? 'text-yellow-400' :
    value >= 4 ? 'text-orange-400' : 'text-red-400';
  return (
    <span className={cn('w-6 text-right text-sm font-bold tabular-nums', color)}>
      {value}
    </span>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { fullMark: number; value: number; subject: string } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold">{d.subject}</p>
      <p className="text-muted-foreground">
        Nota: <span className="font-bold text-foreground">{d.value}</span>/10
      </p>
    </div>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────

function InsightCard({ scores }: { scores: LifeBalanceInput }) {
  const weak = CATEGORIES.filter((c) => (scores[c.key] as number) < 5);

  if (weak.length === 0) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="text-2xl">🎉</div>
          <div>
            <p className="font-semibold text-emerald-400">Roda bem equilibrada!</p>
            <p className="text-xs text-muted-foreground">
              Todas as áreas estão em 5 ou mais. Continue assim!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/20 bg-orange-500/5">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-orange-400">
          <AlertCircle className="h-4 w-4" />
          Áreas que precisam de atenção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {weak.map((cat) => (
          <div key={cat.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{cat.emoji}</span>
              <div>
                <p className="text-sm font-medium">{cat.label}</p>
                <p className="text-xs text-muted-foreground">
                  Nota {scores[cat.key]}/10 — considere criar uma meta nessa área.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" asChild>
              <a href={`/metas?new=1&category=${cat.goalCategory}&title=${encodeURIComponent(`Melhorar ${cat.label}`)}`}>
                <Target className="h-3 w-3" />
                Criar meta
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initial: SerializedLifeBalance | null;
}

export function LifeBalanceClient({ initial }: Props) {
  const router = useRouter();
  const [scores, setScores] = useState<LifeBalanceInput>(
    initial ? { ...initial } : DEFAULT_VALUES,
  );
  const [isPending, startTransition] = useTransition();

  const radarData = CATEGORIES.map((cat) => ({
    subject: cat.label,
    value: scores[cat.key] as number,
    fullMark: 10,
  }));

  const avgScore = Math.round(
    CATEGORIES.reduce((sum, c) => sum + (scores[c.key] as number), 0) / CATEGORIES.length,
  );

  function handleSave() {
    startTransition(async () => {
      const res = await saveLifeBalanceAction(scores);
      if (res.success) {
        toast.success('Roda da Vida salva com sucesso!');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Sliders ── */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ajuste suas notas</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Média: {avgScore}/10
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-medium">{cat.label}</span>
                  <ScoreLabel value={scores[cat.key] as number} />
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={scores[cat.key] as number}
                  onChange={(e) =>
                    setScores((prev) => ({ ...prev, [cat.key]: Number(e.target.value) }))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                />
              </motion.div>
            ))}

            <Button className="mt-2 w-full gap-2" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Roda da Vida
            </Button>
          </CardContent>
        </Card>

        {/* Insights */}
        <InsightCard scores={scores} />
      </div>

      {/* ── Radar Chart ── */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sua Roda da Vida</CardTitle>
            {initial && (
              <p className="text-xs text-muted-foreground">
                Última atualização:{' '}
                {new Date(initial.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                  tickCount={6}
                  axisLine={false}
                />
                <Radar
                  name="Nota"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Score pills */}
            <div className="mt-2 grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const score = scores[cat.key] as number;
                return (
                  <div
                    key={cat.key}
                    className="flex flex-col items-center gap-0.5 rounded-lg border border-border/40 bg-muted/30 py-2 text-center"
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: cat.color }}
                    >
                      {score}
                    </span>
                    <span className="text-[9px] text-muted-foreground leading-tight px-1">
                      {cat.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
