import type { Metadata } from 'next';
import { requireUser } from '@/shared/auth/session';
import { listGestaoBoardQuery } from '@/modules/gestao/application/queries/list-gestao.query';
import { ServersSection } from './servers-section';

export const metadata: Metadata = { title: 'Gestão — VPS' };
export const dynamic = 'force-dynamic';

export default async function VpsPage() {
  const user = await requireUser();
  const board = await listGestaoBoardQuery(user.id);
  return (
    <ServersSection
      initialServers={board.servers}
      projects={board.projects}
      currency={user.currency}
    />
  );
}
