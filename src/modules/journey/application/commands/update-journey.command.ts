import type { JourneyInput } from '@/lib/validators/journey';
import { journeyRepository } from '../../infrastructure/journey.repository';

export interface UpdateJourneyResult {
  id: string;
}

export async function updateJourneyCommand(
  userId: string,
  journeyId: string,
  data: JourneyInput,
): Promise<UpdateJourneyResult> {
  const row = await journeyRepository.updateJourney(userId, journeyId, data);
  return { id: row.id };
}
