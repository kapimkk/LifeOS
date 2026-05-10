'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        {/* Icon */}
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-9 w-9" />
          </div>
          <div className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-background">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="max-w-sm space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Ops! Algo saiu do trilho</h1>
          <p className="text-muted-foreground">
            Não se preocupe — isso acontece às vezes. Nossa equipe já foi notificada e está
            trabalhando para resolver.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60">Código de rastreio: {error.digest}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
