'use client';

import { useMemo, useState, useTransition } from 'react';
import { Compass, Download, Map, Plus, Swords, Zap } from 'lucide-react';
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
import { computeEarnedXp, computeTotalXpAvailable } from '@/modules/journey/domain/xp-progress';
import { downloadXlsx } from '@/lib/export-xlsx';
import type { SerializedJourney, SerializedJourneyStep } from '@/modules/journey/domain/entities';
import {
  addStepToJourneyAction,
  completeStepAction,
  revertStepAction,
  createJourneyAction,
  deleteJourneyAction,
  deleteStepAction,
  updateJourneyAction,
  updateStepAction,
} from '@/modules/journey/interfaces/journey-actions';
import { JourneyHeaderControls } from '@/modules/journey/interfaces/components/journey-header-controls';
import { DeleteConfirmDialog } from '@/modules/journey/interfaces/components/delete-confirm-dialog';
import { JourneyStepCard } from './journey-step-card';
import {
  AddStepDialog,
  CreateJourneyDialog,
  EditJourneyDialog,
  EditStepDialog,
} from './journey-dialogs';

interface Props {
  initialJourneys: SerializedJourney[];
}

type DeleteTarget =
  | { type: 'journey'; journey: SerializedJourney }
  | { type: 'step'; step: SerializedJourneyStep; journeyId: string };

export function JourneyClient({ initialJourneys }: Props) {
  const [journeys, setJourneys] = useState(initialJourneys);
  const [selectedId, setSelectedId] = useState(initialJourneys[0]?.id ?? '');
  const [createOpen, setCreateOpen] = useState(false);
  const [editJourneyOpen, setEditJourneyOpen] = useState(false);
  const [stepOpen, setStepOpen] = useState(false);
  const [editStep, setEditStep] = useState<SerializedJourneyStep | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const JOURNEY_STATUS_LABEL: Record<SerializedJourneyStep['status'], string> = {
    LOCKED: 'Bloqueado',
    IN_PROGRESS: 'Em progresso',
    COMPLETED: 'Concluído',
  };

  const active = useMemo(
    () => journeys.find((j) => j.id === selectedId) ?? journeys[0] ?? null,
    [journeys, selectedId],
  );

  const sortedSteps = useMemo(
    () => (active ? [...active.steps].sort((a, b) => a.order - b.order) : []),
    [active],
  );

  const earnedXp = useMemo(() => computeEarnedXp(sortedSteps), [sortedSteps]);
  const totalXp = useMemo(() => computeTotalXpAvailable(sortedSteps), [sortedSteps]);

  function replaceJourney(updated: SerializedJourney) {
    setJourneys((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  }

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

  async function handleUpdateJourney(data: Parameters<typeof updateJourneyAction>[1]) {
    if (!active) return;
    const res = await updateJourneyAction(active.id, data);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    replaceJourney(res.data);
    setEditJourneyOpen(false);
    toast.success('Jornada atualizada');
  }

  async function handleAddStep(data: Parameters<typeof addStepToJourneyAction>[0]) {
    const res = await addStepToJourneyAction(data);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    replaceJourney(res.data);
    setStepOpen(false);
    toast.success('Passo adicionado');
  }

  async function handleUpdateStep(data: Parameters<typeof updateStepAction>[1]) {
    if (!editStep) return;
    const res = await updateStepAction(editStep.id, data);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    replaceJourney(res.data);
    setEditStep(null);
    toast.success('Missão atualizada');
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
      replaceJourney(res.data);
      const step = res.data.steps.find((s) => s.id === stepId);
      toast.success(`Missão concluída! +${step?.xpReward ?? 0} XP`);
      setCompletingId(null);
    });
  }

  function handleRevert(stepId: string) {
    const step = sortedSteps.find((s) => s.id === stepId);
    setRevertingId(stepId);
    startTransition(async () => {
      const res = await revertStepAction(stepId);
      if (!res.success) {
        toast.error(res.error);
        setRevertingId(null);
        return;
      }
      replaceJourney(res.data);
      toast.success(`Passo revertido. −${step?.xpReward ?? 0} XP`);
      setRevertingId(null);
    });
  }

  function handleExportJourney() {
    if (!active || sortedSteps.length === 0) {
      toast.message('Adicione passos à jornada antes de exportar.');
      return;
    }
    const safeName =
      active.name
        .replace(/[^\w\s-]/g, '')
        .trim()
        .slice(0, 40) || 'jornada';
    downloadXlsx(
      `jornada-${safeName}.xlsx`,
      'Jornada',
      ['Ordem', 'Título', 'Instrutor', 'Dificuldade', 'XP', 'Status', 'Link/URL', 'Descrição'],
      sortedSteps.map((s) => [
        s.order,
        s.title,
        s.instructor ?? '',
        s.difficulty,
        s.xpReward,
        JOURNEY_STATUS_LABEL[s.status],
        s.url ?? '',
        s.description ?? '',
      ]),
    );
    toast.success('Planilha da jornada baixada');
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      if (deleteTarget.type === 'journey') {
        const res = await deleteJourneyAction(deleteTarget.journey.id);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        setJourneys(res.data.journeys);
        setSelectedId(res.data.journeys[0]?.id ?? '');
        toast.success('Jornada excluída');
      } else {
        const res = await deleteStepAction(deleteTarget.step.id);
        if (!res.success) {
          toast.error(res.error);
          return;
        }
        replaceJourney(res.data);
        toast.success('Missão removida');
      }
      setDeleteTarget(null);
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
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-amber-100">
                  <strong className="text-yellow-400">{earnedXp}</strong>
                  <span className="text-amber-200/80"> / {totalXp} XP</span>
                </span>
              </div>
            )}
          </div>

          {active && (
            <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex max-w-lg flex-1 items-start justify-between gap-3 rounded-xl border border-cyan-500/20 bg-slate-900/50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-slate-50">{active.name}</h2>
                  {active.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
                  )}
                </div>
                <JourneyHeaderControls
                  disabled={isPending}
                  onEdit={() => setEditJourneyOpen(true)}
                  onDelete={() => setDeleteTarget({ type: 'journey', journey: active })}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 border-cyan-500/30"
                disabled={sortedSteps.length === 0}
                onClick={handleExportJourney}
              >
                <Download className="mr-1 h-4 w-4" />
                Salvar Jornada
              </Button>
            </div>
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
                      reverting={revertingId === step.id && isPending}
                      managing={isPending}
                      onComplete={handleComplete}
                      onRevert={handleRevert}
                      onEdit={(s) => setEditStep(s)}
                      onDelete={(s) =>
                        setDeleteTarget({
                          type: 'step',
                          step: s,
                          journeyId: active!.id,
                        })
                      }
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
      <EditJourneyDialog
        open={editJourneyOpen}
        onOpenChange={setEditJourneyOpen}
        journey={active}
        onSubmit={handleUpdateJourney}
        submitting={isPending}
      />
      <AddStepDialog
        open={stepOpen}
        onOpenChange={setStepOpen}
        journeyId={active?.id ?? null}
        onSubmit={handleAddStep}
        submitting={isPending}
      />
      <EditStepDialog
        open={Boolean(editStep)}
        onOpenChange={(v) => !v && setEditStep(null)}
        step={editStep}
        onSubmit={handleUpdateStep}
        submitting={isPending}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title={deleteTarget?.type === 'journey' ? 'Excluir jornada?' : 'Excluir missão?'}
        description={
          deleteTarget?.type === 'journey'
            ? `A jornada "${deleteTarget.journey.name}" e todos os passos serão removidos permanentemente.`
            : `A missão "${deleteTarget?.type === 'step' ? deleteTarget.step.title : ''}" será removida e a trilha será reordenada.`
        }
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
