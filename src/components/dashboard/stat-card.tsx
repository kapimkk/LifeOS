'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  /**
   * Elemento React já instanciado (ex.: `<Wallet />`).
   * Server Components não podem passar referências de função (LucideIcon)
   * para Client Components — apenas elementos serializáveis.
   */
  icon: ReactNode;
  trend?: { value: number; label?: string };
  accent?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  delay?: number;
}

const accentBg: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  accent = 'primary',
  delay = 0,
}: StatCardProps) {
  const positive = (trend?.value ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
            {trend && (
              <div
                className={cn(
                  'mt-2 inline-flex items-center gap-1 text-xs font-medium',
                  positive ? 'text-success' : 'text-destructive',
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}% {trend.label && `· ${trend.label}`}
              </div>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5',
              accentBg[accent],
            )}
          >
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
