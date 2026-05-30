import Link from 'next/link';
import { Compass, Map, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { computeEarnedXp, computeTotalXpAvailable } from '@/modules/journey/domain/xp-progress';
import type { SerializedJourney } from '@/modules/journey/domain/entities';

interface Props {
  journeys: SerializedJourney[];
}

export function DashboardJourneySummary({ journeys }: Props) {
  if (journeys.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4 text-cyan-500" />
            Jornada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Você ainda não criou uma trilha de missões. Comece sua saga de estudos.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/jornada">Ir para Jornada</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const primary = journeys[0];
  const steps = [...primary.steps].sort((a, b) => a.order - b.order);
  const earned = computeEarnedXp(steps);
  const total = computeTotalXpAvailable(steps);
  const completed = steps.filter((s) => s.status === 'COMPLETED').length;
  const progressPct = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
  const inProgress = steps.find((s) => s.status === 'IN_PROGRESS');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Compass className="h-4 w-4 text-cyan-500" />
          Jornada
        </CardTitle>
        <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
          <Link href="/jornada">Ver trilha</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">{primary.name}</p>
          {primary.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{primary.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>
              <strong className="text-amber-200">{earned}</strong>
              <span className="text-muted-foreground"> / {total} XP</span>
            </span>
          </div>
          <span className="text-muted-foreground">
            {completed}/{steps.length} missões concluídas
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        {inProgress && (
          <p className="text-sm">
            <span className="text-muted-foreground">Em andamento: </span>
            <span className="font-medium">{inProgress.title}</span>
          </p>
        )}

        {journeys.length > 1 && (
          <p className="text-xs text-muted-foreground">
            +{journeys.length - 1} outra{journeys.length > 2 ? 's' : ''} jornada
            {journeys.length > 2 ? 's' : ''} no total
          </p>
        )}
      </CardContent>
    </Card>
  );
}
