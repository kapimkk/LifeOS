'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Home, LockKeyhole, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Heurística simples para detectar erros de autenticação/autorização. */
function isAuthError(error: Error): boolean {
  const msg = error.message?.toLowerCase() ?? '';
  return (
    msg.includes('não autenticado') ||
    msg.includes('autenticação') ||
    msg.includes('unauthorized') ||
    msg.includes('unauthenticated') ||
    msg.includes('faça login') ||
    msg.includes('sessão') ||
    msg.includes('token') ||
    msg.includes('401') ||
    msg.includes('403') ||
    error.name === 'UnauthorizedError'
  );
}

/** Retorna uma mensagem legível ao usuário a partir do erro. */
function getErrorDetails(error: Error): {
  title: string;
  description: string;
  isAuth: boolean;
} {
  const auth = isAuthError(error);

  if (auth) {
    return {
      title: 'Sessão expirada ou acesso negado',
      description:
        error.message && error.message.length < 200
          ? error.message
          : 'Sua sessão pode ter expirado. Faça login novamente para continuar.',
      isAuth: true,
    };
  }

  // Exibe a mensagem real se for curta e legível (não um stack trace)
  const rawMsg = error.message ?? '';
  const isReadable = rawMsg.length > 0 && rawMsg.length < 200 && !rawMsg.includes('    at ');

  return {
    title: 'Ops! Algo saiu do trilho',
    description: isReadable
      ? rawMsg
      : 'Ocorreu um erro inesperado. Se o problema persistir, tente recarregar a página.',
    isAuth: false,
  };
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  const { title, description, isAuth } = getErrorDetails(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        {/* Ícone */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          {isAuth ? (
            <LockKeyhole className="h-9 w-9" />
          ) : (
            <AlertTriangle className="h-9 w-9" />
          )}
        </div>

        {/* Mensagem */}
        <div className="max-w-sm space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>

          {/* Código de rastreio — apenas para erros não-auth */}
          {!isAuth && error.digest && (
            <p className="mt-1 text-xs text-muted-foreground/50">
              Código: {error.digest}
            </p>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {isAuth ? (
            <Button asChild className="gap-2">
              <Link href="/login">
                <LockKeyhole className="h-4 w-4" />
                Fazer login novamente
              </Link>
            </Button>
          ) : (
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          )}

          <Button variant="outline" asChild className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Link>
          </Button>

          <Button variant="ghost" asChild className="gap-2 text-muted-foreground">
            <Link href="/">
              <Home className="h-4 w-4" />
              Página inicial
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
