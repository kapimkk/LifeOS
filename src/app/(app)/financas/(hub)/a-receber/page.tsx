import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { requireUser } from '@/shared/auth/session';
import {
  getReceivablesTotalQuery,
  listReceivablesQuery,
} from '@/modules/finance/application/queries/list-receivables.query';
import { ReceivablesSection } from '@/app/(app)/financas/receivables-section';

export const metadata: Metadata = { title: 'Finanças — A receber' };
export const dynamic = 'force-dynamic';

export default async function FinanceReceivablesPage() {
  const user = await requireUser();
  const [items, total] = await Promise.all([
    listReceivablesQuery(user.id),
    getReceivablesTotalQuery(user.id),
  ]);

  return (
    <>
      <PageHeader
        title="Finanças"
        description="Registre quem te deve e acompanhe o total a receber."
      />
      <ReceivablesSection initialItems={items} initialTotal={total} currency={user.currency} />
    </>
  );
}
