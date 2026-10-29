import type { Metadata } from 'next';
import { requireUser } from '@/shared/auth/session';
import { listGestaoBoardQuery } from '@/modules/gestao/application/queries/list-gestao.query';
import { ProjectsSection } from './projects-section';

export const metadata: Metadata = { title: 'Gestão — Projetos' };
export const dynamic = 'force-dynamic';

export default async function ProjetosPage() {
  const user = await requireUser();
  const board = await listGestaoBoardQuery(user.id);
  return (
    <ProjectsSection
      initialProjects={board.projects}
      customers={board.customers}
      servers={board.servers}
    />
  );
}
