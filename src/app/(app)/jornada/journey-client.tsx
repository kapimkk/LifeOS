'use client';

import { useMemo, useState, useTransition } from 'react';
import { Compass, Map, Plus, Swords } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SerializedJourney } from '@/modules/journey/domain/entities';
import {
  addStepToJourneyAction,
  completeStepAction,
  createJourneyAction,
} from '@/modules/journey/interfaces/journey-actions';
import { JourneyStepCard } from './journey-step-card';
import { AddStepDialog, CreateJourneyDialog } from './journey-dialogs';

interface Props {
  initialJourneys: SerializedJourney[];
}

export function JourneyClient({ initialJourneys }: Props) {
  const [journeys, setJourneys] = useState(initialJourneys);
  const [selectedId, setSelectedId] = useState(initialJourneys[0]?.id ?? '');
  const [createOpen, setCreateOpen] = useState(false);
  const [stepOpen, setStepOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = useMemo(
    () => journeys.find((j) => j.id === selectedId) ?? journeys[0] ?? null,
    [journeys, selectedId],
  );

  const sortedSteps = useMemo(
    () => (active ? [...active.steps].sort((a, b) => a.order - b.order) : []),
    [active],
  );

  const totalXp = useMemo(
    () => sortedSteps.filter((s) => s.status === 'COMPLETED').reduce((a, s) => a + s.xpReward, 0),
    [sortedSteps],
  );

  async function handleCreateJourney(data: Parameters<typeof createJourneyAction>[0]) {
    const res = await createJourneyAction(data);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setJourneys((prev) => [res.data, ...prev]);
    setSelectedId(res.data.id);
    setCreateOpen(false);
    toast.success('Jornada criada');
  }

  async function handleAddStep(data: Parameters<typeof addStepToJourneyAction>[0]) {
    const res = await addStepToJourneyAction(data);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setJourneys((prev) => prev.map((j) => (j.id === res.data.id ? res.data : j)));
    setStepOpen(false);
    toast.success('Passo adicionado');
  }

  function handleComplete(stepId: string) {
    setCompletingId(stepId);
    startTransition(async () => {
      const res = await completeStepAction(stepId);
      if (!res.success) {
        toast.error(res.error);
        setCompletingId(null);
        return;
      }
      setJourneys((prev) => prev.map((j) => (j.id === res.data.id ? res.data : j)));
      toast.success('Missão concluída! +XP');
      setCompletingId(null);
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-6 bg-gradient-to-b from-slate-950 via-background to-background pb-16">
      <PageHeader
        title="Jornada"
        description="Sua árvore de missões — desbloqueie passos e ganhe XP."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nova jornada
            </Button>
            {active && (
              <Button size="sm" onClick={() => setStepOpen(true)}>
                <Swords className="mr-1 h-4 w-4" /> Novo passo
              </Button>
            )}
          </div>
        }
      />

      {journeys.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-cyan-500/30 bg-slate-900/40 p-10 text-center">
          <Map className="mx-auto h-10 w-10 text-cyan-400/70" />
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhuma jornada ainda. Crie sua primeira trilha de estudos.
          </p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            Começar jornada
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Compass className="h-4 w-4 text-cyan-400" />
              Trilha ativa
            </div>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-[min(100%,280px)] border-cyan-500/20 bg-slate-900/60">
                <SelectValue placeholder="Selecione a jornada" />
              </SelectTrigger>
              <SelectContent>
                {journeys.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {active && (
              <p className="text-xs text-amber-300/90">
                XP conquistado: <strong>{totalXp}</strong>
              </p>
            )}
          </div>

          {active?.description && (
            <p className="max-w-lg text-sm text-muted-foreground">{active.description}</p>
          )}

          <div className="relative mx-auto flex max-w-lg flex-col items-center py-4">
            <div
              className="absolute bottom-8 left-1/2 top-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-cyan-500/20 via-cyan-400/50 to-cyan-500/10"
              aria-hidden
            />

            {sortedSteps.length === 0 ? (
              <p className="relative z-10 rounded-lg border border-dashed border-slate-600 px-6 py-8 text-center text-sm text-muted-foreground">
                Adicione o primeiro passo desta jornada.
              </p>
            ) : (
              <ul className="relative z-10 flex w-full flex-col items-center gap-10">
                {sortedSteps.map((step, i) => (
                  <li key={step.id} className="w-full">
                    <JourneyStepCard
                      step={step}
                      index={i}
                      total={sortedSteps.length}
                      completing={completingId === step.id && isPending}
                      onComplete={handleComplete}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <CreateJourneyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateJourney}
        submitting={isPending}
      />
      <AddStepDialog
        open={stepOpen}
        onOpenChange={setStepOpen}
        journeyId={active?.id ?? null}
        onSubmit={handleAddStep}
        submitting={isPending}
      />
    </div>
  );
}
