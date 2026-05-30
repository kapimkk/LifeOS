import { journeyRepository } from '../../infrastructure/journey.repository';

export interface RevertStepResult {
  journeyId: string;
}

export async function revertStepCommand(userId: string, stepId: string): Promise<RevertStepResult> {
  const journeyId = await journeyRepository.revertStep(userId, stepId);
  return { journeyId };
}
