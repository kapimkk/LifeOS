import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PreferencesForm } from './preferences-form';
import { requireUser } from '@/server/auth/session';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Configurações' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await requireUser();
  const prefs = await prisma.userPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id, theme: 'dark' },
    update: {},
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Personalize sua experiência no LifeOS" />

      <Card>
        <CardHeader>
          <CardTitle>Aparência e notificações</CardTitle>
          <CardDescription>Preferências da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm
            defaults={{
              theme: prefs.theme as 'dark' | 'light' | 'system',
              weeklyDigest: prefs.weeklyDigest,
              emailReminders: prefs.emailReminders,
              pushReminders: prefs.pushReminders,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
