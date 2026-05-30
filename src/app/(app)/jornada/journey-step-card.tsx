'use client';

import { Lock, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SerializedJourneyStep } from '@/modules/journey/domain/entities';

interface Props {
  step: SerializedJourneyStep;
  index: number;
  total: number;
  completing: boolean;
  onComplete: (stepId: string) => void;
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Dificuldade ${level} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < level
              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
              : 'text-slate-600',
          )}
        />
      ))}
    </div>
  );
}

export function JourneyStepCard({ step, index, total, completing, onComplete }: Props) {
  const locked = step.status === 'LOCKED';
  const inProgress = step.status === 'IN_PROGRESS';
  const completed = step.status === 'COMPLETED';

  const tagline =
    step.description?.trim() ||
    (index === 0 ? 'Todo herói começa com um único passo...' : 'Continue sua saga.');

  return (
    <div className="relative flex w-full max-w-lg justify-center">
      <article
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border px-6 py-5 transition-all duration-300',
          locked && 'border-slate-700/50 bg-slate-950/40 opacity-45',
          inProgress &&
            'border-cyan-400/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_32px_rgba(34,211,238,0.25)]',
          completed &&
            'border-emerald-500/40 bg-gradient-to-br from-slate-900/90 to-emerald-950/20 opacity-90',
        )}
      >
        {inProgress && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cyan-400/30"
            aria-hidden
          />
        )}

        {locked && (
          <div className="absolute right-4 top-4 text-slate-500">
            <Lock className="h-5 w-5" />
          </div>
        )}

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">
          Missão {step.order} / {total}
        </p>
        <h3 className="mt-2 text-lg font-bold uppercase tracking-wide text-slate-50">
          {step.title}
        </h3>

        {step.instructor && (
          <p className="mt-1 text-xs font-medium text-slate-400">
            Instrutor: <span className="text-slate-300">{step.instructor}</span>
          </p>
        )}

        <div className="mt-3">
          <DifficultyStars level={step.difficulty} />
        </div>

        <p className="mt-3 text-sm italic text-slate-400">&ldquo;{tagline}&rdquo;</p>

        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber-300">
          <Sparkles className="h-4 w-4 text-amber-200 drop-shadow-[0_0_8px_rgba(252,211,77,0.9)]" />
          <span>+{step.xpReward} XP</span>
        </div>

        {step.url && !locked && (
          <a
            href={step.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs text-cyan-400 underline-offset-2 hover:underline"
          >
            Abrir conteúdo do curso
          </a>
        )}

        <div className="mt-5">
          {completed ? (
            <Button className="w-full cursor-default bg-emerald-600/20 text-emerald-300" disabled>
              ✓ Missão concluída
            </Button>
          ) : locked ? (
            <Button
              className="w-full border border-slate-600 bg-slate-800/50 text-slate-400"
              disabled
            >
              🔒 Complete a missão anterior
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-500 hover:to-blue-500"
              disabled={completing}
              onClick={() => onComplete(step.id)}
            >
              {completing ? 'Registrando...' : 'Marcar como Concluída'}
            </Button>
          )}
        </div>
      </article>
    </div>
  );
}
