import type { Metadata } from 'next';
import { requireUser } from '@/shared/auth/session';
import { listJourneysQuery } from '@/modules/journey/application/queries/list-journeys.query';
import { serializeJourney } from '@/modules/journey/interfaces/serialize-journey';
import { JourneyClient } from './journey-client';

export const metadata: Metadata = { title: 'Jornada' };
export const dynamic = 'force-dynamic';

export default async function JornadaPage() {
  const user = await requireUser();
  const rows = await listJourneysQuery(user.id);
  const journeys = rows.map((j) =>
    serializeJourney({
      id: j.id,
      userId: j.userId,
      name: j.name,
      description: j.description,
      createdAt: j.createdAt,
      steps: j.steps.map((s) => ({
        id: s.id,
        journeyId: s.journeyId,
        title: s.title,
        description: s.description,
        url: s.url,
        instructor: s.instructor,
        difficulty: s.difficulty,
        xpReward: s.xpReward,
        order: s.order,
        status: s.status as 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED',
      })),
    }),
  );

  return <JourneyClient initialJourneys={journeys} />;
}
