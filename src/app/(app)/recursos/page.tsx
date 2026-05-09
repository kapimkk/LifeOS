import type { Metadata } from 'next';
import { BookOpen, Bookmark, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { ResourcesClient } from './resources-client';
import { requireUser } from '@/server/auth/session';
import { resourcesService } from '@/server/services/resources';

export const metadata: Metadata = { title: 'Recursos' };
export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const user = await requireUser();
  const [items, categories] = await Promise.all([
    resourcesService.list(user.id),
    resourcesService.categories(user.id),
  ]);

  const total = items.length;
  const done = items.filter((r) => r.status === 'DONE').length;
  const toRead = items.filter((r) => r.status === 'TO_READ').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cofre de recursos"
        description="Guarde links, artigos, vídeos e cursos para ver depois."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total salvos" value={String(total)} icon={<Bookmark />} accent="primary" />
        <StatCard label="Para ler" value={String(toRead)} icon={<BookOpen />} accent="info" />
        <StatCard label="Concluídos" value={String(done)} icon={<CheckCheck />} accent="success" />
      </div>

      <ResourcesClient initialResources={items} initialCategories={categories} />
    </div>
  );
}
