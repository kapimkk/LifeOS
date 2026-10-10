import { FixedExpenseGroupPage, fixedExpenseGroupMetadata } from '../group-page';

export const metadata = fixedExpenseGroupMetadata('INVESTIMENTOS');
export const dynamic = 'force-dynamic';

export default function InvestimentosFixosPage() {
  return <FixedExpenseGroupPage group="INVESTIMENTOS" />;
}
