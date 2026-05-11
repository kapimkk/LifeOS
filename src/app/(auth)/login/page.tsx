import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Entrar' };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-sm text-muted-foreground">Entre na sua conta para continuar evoluindo</p>
      </div>

      {/* Suspense é obrigatório pois LoginForm usa useSearchParams() */}
      <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta ainda?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
