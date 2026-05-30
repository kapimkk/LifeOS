import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { requireUser } from '@/shared/auth/session';
import { listInvestmentsQuery } from '@/modules/finance/application/queries/list-investments.query';
import { InvestmentsSection } from '@/app/(app)/financas/investments-section';

export const metadata: Metadata = { title: 'Investimentos' };
export const dynamic = 'force-dynamic';

export default async function InvestimentosPage() {
  const user = await requireUser();
  const investments = await listInvestmentsQuery(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        description="Acompanhe suas caixinhas e alocações de patrimônio."
      />
      <InvestmentsSection initialInvestments={investments} currency={user.currency} />
    </div>
  );
}
