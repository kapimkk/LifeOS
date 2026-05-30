'use client';

import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  xpReward: number;
  earned?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

/** Exibe xpReward do Prisma de forma proeminente. */
export function JourneyXpBadge({ xpReward, earned, className, size = 'md' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-bold tabular-nums',
        earned
          ? 'border-amber-400/50 bg-amber-500/15 text-amber-300'
          : 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className,
      )}
    >
      <Zap
        className={cn(
          'shrink-0',
          size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
          earned ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]' : 'text-cyan-400',
        )}
        aria-hidden
      />
      +{xpReward} XP
    </span>
  );
}
