import type { Metadata } from 'next';
import { requireUser } from '@/shared/auth/session';
import type { FixedExpenseGroup } from '@/lib/validators/fixed-expense';
import { fixedExpenseGroupMeta } from '@/app/(app)/financas/fixed-expense-groups';
import { FixedExpensesSection } from '@/app/(app)/financas/fixed-expenses-section';
import {
  getFixedExpensesTotalQuery,
  listFixedExpensesQuery,
} from '@/modules/finance/application/queries/list-fixed-expenses.query';

export function fixedExpenseGroupMetadata(group: FixedExpenseGroup): Metadata {
  const meta = fixedExpenseGroupMeta(group);
  return { title: `Finanças — Gastos Fixos · ${meta.label}` };
}

export async function FixedExpenseGroupPage({ group }: { group: FixedExpenseGroup }) {
  const user = await requireUser();
  const [items, total] = await Promise.all([
    listFixedExpensesQuery(user.id, group),
    getFixedExpensesTotalQuery(user.id, group),
  ]);

  return (
    <FixedExpensesSection
      group={group}
      initialItems={items}
      initialTotal={total}
      currency={user.currency}
    />
  );
}
