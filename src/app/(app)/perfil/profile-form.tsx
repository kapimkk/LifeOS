'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/fetcher';
import { updateProfileSchema } from '@/lib/validators/user';

type FormValues = z.infer<typeof updateProfileSchema>;

interface Props {
  defaultValues: { name: string; currency: string; locale: string; timezone: string };
}

export function ProfileForm({ defaultValues }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await apiFetch('/api/me', { method: 'PATCH', body: JSON.stringify(values) });
      toast.success('Perfil atualizado');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="currency">Moeda</Label>
          <Input id="currency" maxLength={3} {...register('currency')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locale">Idioma</Label>
          <Input id="locale" {...register('locale')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Fuso horário</Label>
          <Input id="timezone" {...register('timezone')} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
