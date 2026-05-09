import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OnboardingClient } from './onboarding-client';
import { requireUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Bem-vindo' };
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardedAt) redirect('/dashboard');

  return <OnboardingClient name={user.name} />;
}
