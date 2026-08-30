import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { requireUser } from '@/shared/auth/session';
import { formatDate } from '@/lib/utils';
import { SettingsClient } from './settings-client';

export const metadata: Metadata = { title: 'Configurações' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Personalize a aparência do LifeOS do seu jeito."
      />
      <SettingsClient
        account={{
          name: user.name,
          email: user.email,
          role: user.role,
          currency: user.currency,
          locale: user.locale,
          timezone: user.timezone,
          memberSince: user.onboardedAt ? formatDate(user.onboardedAt) : null,
        }}
      />
    </div>
  );
}
