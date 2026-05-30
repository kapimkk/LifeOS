import { journeyRepository } from '../../infrastructure/journey.repository';

export async function getJourneyWithStepsQuery(userId: string, journeyId: string) {
  return journeyRepository.findByIdWithSteps(userId, journeyId);
}
