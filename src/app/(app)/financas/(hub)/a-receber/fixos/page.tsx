import type { Metadata } from 'next';
import { requireUser } from '@/shared/auth/session';
import { listFixedReceivablesQuery } from '@/modules/finance/application/queries/list-fixed-receivables.query';
import { FixedReceivablesSection } from '@/app/(app)/financas/fixed-receivables-section';

export const metadata: Metadata = { title: 'Finanças — A receber · Fixos' };
export const dynamic = 'force-dynamic';

export default async function FinanceFixedReceivablesPage() {
  const user = await requireUser();
  const items = await listFixedReceivablesQuery(user.id);

  return <FixedReceivablesSection initialItems={items} currency={user.currency} />;
}
