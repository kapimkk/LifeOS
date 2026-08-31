import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { requireUser } from '@/shared/auth/session';
import { listRoutineItemsQuery } from '@/modules/routine/application/queries/list-routine-items.query';
import { RoutineClient } from './routine-client';

export const metadata: Metadata = { title: 'Rotina Semanal' };
export const dynamic = 'force-dynamic';

export default async function RotinaPage() {
  const user = await requireUser();
  const items = await listRoutineItemsQuery(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rotina semanal"
        description="Planeje o que fazer em cada horário, de segunda a domingo."
      />
      <RoutineClient initialItems={items} />
    </div>
  );
}
