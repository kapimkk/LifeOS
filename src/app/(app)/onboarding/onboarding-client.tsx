'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Flame, Sparkles, Target, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/fetcher';

interface Step {
  icon: typeof Sparkles;
  title: string;
  description: string;
  highlights: string[];
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: 'Bem-vindo ao LifeOS',
    description: 'O painel de controle da sua vida pessoal e financeira.',
    highlights: [
      'Tudo em um só lugar',
      'Visual moderno e dark por padrão',
      'Foco em clareza e progresso',
    ],
  },
  {
    icon: Wallet,
    title: 'Controle financeiro',
    description: 'Cadastre receitas e despesas, organize por categorias e acompanhe gráficos.',
    highlights: [
      'Recorrência diária, semanal, mensal',
      'Categorias personalizáveis',
      'Saldo, gráficos e previsões',
    ],
  },
  {
    icon: Target,
    title: 'Metas e hábitos',
    description: 'Defina objetivos, acompanhe progresso e construa rotinas saudáveis.',
    highlights: [
      'Metas com prioridade e prazo',
      'Hábitos com streak e calendário',
      'Consistência ao longo do tempo',
    ],
  },
  {
    icon: Flame,
    title: 'Pronto para começar',
    description: 'Vamos para o seu dashboard. Você pode personalizar tudo a qualquer momento.',
    highlights: ['Dashboard com tudo de uma vez', 'Tarefas e produtividade', 'Notificações e perfil'],
  },
];

export function OnboardingClient({ name }: { name: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step]!;
  const Icon = current.icon;

  async function next() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/api/me/onboarding', { method: 'POST' });
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-80" />

      <Card className="relative z-10 w-full max-w-xl overflow-hidden">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Passo {step + 1} de {STEPS.length}
            </span>
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-foreground"
            >
              Pular
            </button>
          </div>

          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {step === 0 ? `Olá, ${name.split(' ')[0]}` : current.title}
                </h2>
                {step === 0 && (
                  <p className="mt-1 text-sm text-primary">{current.title}</p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">{current.description}</p>
              </div>

              <ul className="space-y-2">
                {current.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Voltar
            </Button>
            <Button onClick={next} disabled={submitting}>
              {isLast ? 'Ir para o dashboard' : 'Próximo'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
