import type { UpdateJourneyStepInput } from '@/lib/validators/journey';
import { journeyRepository } from '../../infrastructure/journey.repository';

export interface UpdateStepResult {
  id: string;
  journeyId: string;
}

export async function updateStepCommand(
  userId: string,
  stepId: string,
  data: UpdateJourneyStepInput,
): Promise<UpdateStepResult> {
  const row = await journeyRepository.updateStep(userId, stepId, data);
  return { id: row.id, journeyId: row.journeyId };
}
