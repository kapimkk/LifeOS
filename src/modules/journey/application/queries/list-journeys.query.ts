import { journeyRepository } from '../../infrastructure/journey.repository';

export async function listJourneysQuery(userId: string) {
  return journeyRepository.findByUserId(userId);
}
