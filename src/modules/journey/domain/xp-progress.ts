import type { JourneyStepStatus } from './entities';

type StepXpSlice = { status: JourneyStepStatus; xpReward: number };

/**
 * XP total é sempre derivado dos passos COMPLETED × xpReward atual.
 * Não há saldo persistido: alterar xpReward de um passo já concluído
 * reflete imediatamente no total (sem duplicar ou “descontar” XP antigo).
 */
export function computeEarnedXp(steps: StepXpSlice[]): number {
  return steps.filter((s) => s.status === 'COMPLETED').reduce((sum, s) => sum + s.xpReward, 0);
}

export function computeTotalXpAvailable(steps: StepXpSlice[]): number {
  return steps.reduce((sum, s) => sum + s.xpReward, 0);
}
