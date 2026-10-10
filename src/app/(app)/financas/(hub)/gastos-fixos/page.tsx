import { FixedExpenseGroupPage, fixedExpenseGroupMetadata } from './group-page';

export const metadata = fixedExpenseGroupMetadata('GERAL');
export const dynamic = 'force-dynamic';

export default function FinanceFixedExpensesPage() {
  return <FixedExpenseGroupPage group="GERAL" />;
}
