import { FixedExpenseGroupPage, fixedExpenseGroupMetadata } from '../group-page';

export const metadata = fixedExpenseGroupMetadata('PLANOS');
export const dynamic = 'force-dynamic';

export default function PlanosPage() {
  return <FixedExpenseGroupPage group="PLANOS" />;
}
