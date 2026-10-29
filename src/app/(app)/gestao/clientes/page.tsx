import type { Metadata } from 'next';
import { requireUser } from '@/shared/auth/session';
import { listGestaoBoardQuery } from '@/modules/gestao/application/queries/list-gestao.query';
import { ClientsSection } from './clients-section';

export const metadata: Metadata = { title: 'Gestão — Clientes' };
export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const user = await requireUser();
  const board = await listGestaoBoardQuery(user.id);
  return <ClientsSection initialCustomers={board.customers} projects={board.projects} />;
}
