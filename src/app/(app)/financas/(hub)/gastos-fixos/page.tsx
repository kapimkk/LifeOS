import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { requireUser } from '@/shared/auth/session';
import {
  getFixedExpensesTotalQuery,
  listFixedExpensesQuery,
} from '@/modules/finance/application/queries/list-fixed-expenses.query';
import { FixedExpensesSection } from '@/app/(app)/financas/fixed-expenses-section';

export const metadata: Metadata = { title: 'Finanças — Gastos Fixos' };
export const dynamic = 'force-dynamic';

export default async function FinanceFixedExpensesPage() {
  const user = await requireUser();
  const [items, total] = await Promise.all([
    listFixedExpensesQuery(user.id),
    getFixedExpensesTotalQuery(user.id),
  ]);

  return (
    <>
      <PageHeader
        title="Finanças"
        description="Marque o que já foi pago e limpe as marcações quando o mês recomeçar."
      />
      <FixedExpensesSection initialItems={items} initialTotal={total} currency={user.currency} />
    </>
  );
}
