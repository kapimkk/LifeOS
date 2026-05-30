import { journeyRepository } from '../../infrastructure/journey.repository';

export interface CompleteStepResult {
  journeyId: string;
}

export async function completeStepCommand(
  userId: string,
  stepId: string,
): Promise<CompleteStepResult> {
  const journeyId = await journeyRepository.completeStep(userId, stepId);
  return { journeyId };
}
