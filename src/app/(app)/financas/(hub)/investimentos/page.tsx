import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { requireUser } from '@/shared/auth/session';
import { listInvestmentsQuery } from '@/modules/finance/application/queries/list-investments.query';
import { InvestmentsSection } from '@/app/(app)/financas/investments-section';

export const metadata: Metadata = { title: 'Finanças — Investimentos' };
export const dynamic = 'force-dynamic';

export default async function FinanceInvestmentsPage() {
  const user = await requireUser();
  const investments = await listInvestmentsQuery(user.id);

  return (
    <>
      <PageHeader title="Finanças" description="Acompanhe investimentos e gastos fixos do mês." />
      <InvestmentsSection initialInvestments={investments} currency={user.currency} />
    </>
  );
}
