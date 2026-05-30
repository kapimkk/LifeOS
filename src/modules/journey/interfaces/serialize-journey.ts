import type { Journey, JourneyStep } from '../domain/entities';
import type { SerializedJourney, SerializedJourneyStep } from '../domain/entities';

type JourneyRow = Journey & { steps: JourneyStep[] };

function serializeStep(step: JourneyStep): SerializedJourneyStep {
  return {
    id: step.id,
    journeyId: step.journeyId,
    title: step.title,
    description: step.description,
    url: step.url,
    instructor: step.instructor,
    difficulty: step.difficulty,
    xpReward: step.xpReward,
    order: step.order,
    status: step.status,
  };
}

export function serializeJourney(row: JourneyRow): SerializedJourney {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    steps: row.steps.map(serializeStep),
  };
}
