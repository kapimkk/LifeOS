import { journeyRepository } from '../../infrastructure/journey.repository';

export interface DeleteJourneyResult {
  id: string;
}

export async function deleteJourneyCommand(
  userId: string,
  journeyId: string,
): Promise<DeleteJourneyResult> {
  await journeyRepository.deleteJourney(userId, journeyId);
  return { id: journeyId };
}
