import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { ProfileForm } from './profile-form';
import { AvatarUploader } from './avatar-uploader';
import { PasswordForm } from './password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Perfil' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Suas informações pessoais e foto" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Foto de perfil</CardTitle>
            <CardDescription>PNG, JPG ou WEBP até 4MB</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUploader name={user.name} avatarUrl={user.avatarUrl ?? null} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
            <CardDescription>Atualize seus dados</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                name: user.name,
                currency: user.currency,
                locale: user.locale,
                timezone: user.timezone,
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>Use uma senha forte com pelo menos 8 caracteres</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
