import { journeyRepository } from '../../infrastructure/journey.repository';

export interface DeleteStepResult {
  id: string;
  journeyId: string;
}

export async function deleteStepCommand(userId: string, stepId: string): Promise<DeleteStepResult> {
  return journeyRepository.deleteStep(userId, stepId);
}
