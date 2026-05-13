import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { getLifeBalance } from '@/modules/life-balance/interfaces/actions';
import { LifeBalanceClient } from './life-balance-client';

export const metadata: Metadata = { title: 'Roda da Vida | LifeOS' };
export const dynamic = 'force-dynamic';

export default async function RodaDaVidaPage() {
  const balance = await getLifeBalance();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roda da Vida"
        description="Visualize o equilíbrio das grandes áreas da sua vida e identifique onde focar sua energia."
      />
      <LifeBalanceClient initial={balance} />
    </div>
  );
}
