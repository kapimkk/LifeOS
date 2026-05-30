import type { JourneyInput } from '@/lib/validators/journey';
import { journeyRepository } from '../../infrastructure/journey.repository';

export interface CreateJourneyResult {
  id: string;
}

export async function createJourneyCommand(
  userId: string,
  data: JourneyInput,
): Promise<CreateJourneyResult> {
  const journey = await journeyRepository.createJourney(userId, data);
  return { id: journey.id };
}
