import type { JourneyStepInput } from '@/lib/validators/journey';
import { journeyRepository } from '../../infrastructure/journey.repository';

export interface AddStepToJourneyResult {
  id: string;
  journeyId: string;
}

export async function addStepToJourneyCommand(
  userId: string,
  data: JourneyStepInput,
): Promise<AddStepToJourneyResult> {
  const step = await journeyRepository.addStep(userId, data);
  return { id: step.id, journeyId: step.journeyId };
}
