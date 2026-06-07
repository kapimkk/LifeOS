import type { Metadata } from 'next';
import { Gift, ShoppingBag } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { requireUser } from '@/shared/auth/session';
import { listWishesQuery } from '@/modules/wishes/application/queries/list-wishes.query';
import { WishesClient } from './wishes-client';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Desejos' };
export const dynamic = 'force-dynamic';

export default async function DesejosPage() {
  const user = await requireUser();
  const items = await listWishesQuery(user.id);
  const total = items.reduce((acc, w) => acc + w.price, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lista de desejos"
        description="Organize o que você quer comprar por categoria."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Itens salvos"
          value={String(items.length)}
          icon={<Gift />}
          accent="primary"
        />
        <StatCard
          label="Valor total"
          value={formatCurrency(total, user.currency)}
          icon={<ShoppingBag />}
          accent="info"
        />
      </div>

      <WishesClient initialItems={items} currency={user.currency} />
    </div>
  );
}
