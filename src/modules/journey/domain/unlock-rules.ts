import type { JourneyStepStatus } from './entities';

export interface StepOrderSnapshot {
  order: number;
  status: JourneyStepStatus;
}

/**
 * Regra: o passo N só pode estar IN_PROGRESS ou COMPLETED se o passo N-1 estiver COMPLETED.
 * O primeiro passo (menor order) inicia em IN_PROGRESS quando ainda não foi concluído.
 */
export function resolveStepStatus(
  step: StepOrderSnapshot,
  previous: StepOrderSnapshot | null,
): JourneyStepStatus {
  if (step.status === 'COMPLETED') return 'COMPLETED';
  if (!previous) return 'IN_PROGRESS';
  if (previous.status === 'COMPLETED') return 'IN_PROGRESS';
  return 'LOCKED';
}

export function canCompleteStep(
  step: StepOrderSnapshot,
  previous: StepOrderSnapshot | null,
): boolean {
  return resolveStepStatus(step, previous) === 'IN_PROGRESS';
}

export function assertCanCompleteStep(
  step: StepOrderSnapshot,
  previous: StepOrderSnapshot | null,
): void {
  if (!canCompleteStep(step, previous)) {
    const err = new Error('Complete a missão anterior para desbloquear esta etapa.') as Error & {
      status?: number;
    };
    err.status = 403;
    throw err;
  }
}

export function initialStatusForNewStep(existingCount: number): JourneyStepStatus {
  return existingCount === 0 ? 'IN_PROGRESS' : 'LOCKED';
}
