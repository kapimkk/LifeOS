'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
});

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// App mockup components (static preview of real UI)
// ---------------------------------------------------------------------------
function FinancePreview() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Saldo', value: 'R$ 4.280', color: 'text-emerald-400' },
          { label: 'Receitas', value: 'R$ 8.500', color: 'text-emerald-400' },
          { label: 'Despesas', value: 'R$ 4.220', color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-muted/50 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={cn('text-xs font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          { desc: 'Salário', cat: 'Receita', val: '+8.500', income: true },
          { desc: 'Supermercado', cat: 'Alimentação', val: '-320', income: false },
          { desc: 'Netflix', cat: 'Lazer', val: '-45', income: false },
          { desc: 'Academia', cat: 'Saúde', val: '-90', income: false },
        ].map((t) => (
          <div key={t.desc} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/40">
            <div className={cn('h-6 w-6 rounded-md flex items-center justify-center shrink-0', t.income ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
              {t.income ? <TrendingUp className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
            </div>
            <span className="flex-1 font-medium">{t.desc}</span>
            <Badge variant="outline" className="hidden text-[9px] sm:flex">{t.cat}</Badge>
            <span className={cn('font-semibold', t.income ? 'text-emerald-400' : 'text-red-400')}>{t.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsPreview() {
  return (
    <div className="space-y-2.5">
      {[
        { title: 'Reserva de emergência', cat: 'Financeira', pct: 65, color: '#22c55e' },
        { title: 'Aprender um novo idioma', cat: 'Estudos', pct: 40, color: '#6366f1' },
        { title: 'Correr 5km sem parar', cat: 'Fitness', pct: 80, color: '#f59e0b' },
        { title: 'Promoção no trabalho', cat: 'Carreira', pct: 25, color: '#0ea5e9' },
      ].map((g) => (
        <div key={g.title} className="rounded-lg border border-border/50 bg-muted/30 p-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="truncate text-xs font-medium">{g.title}</p>
            <Badge variant="outline" className="shrink-0 text-[9px]">{g.cat}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${g.pct}%`, backgroundColor: g.color }} />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">{g.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HabitsPreview() {
  return (
    <div className="space-y-2">
      {[
        { title: 'Beber 2L de água', streak: 12, done: true, color: '#06b6d4' },
        { title: 'Ler 30 minutos', streak: 7, done: true, color: '#a855f7' },
        { title: 'Meditar', streak: 3, done: false, color: '#f59e0b' },
        { title: 'Treinar', streak: 21, done: true, color: '#22c55e' },
      ].map((h) => (
        <div key={h.title} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all')} style={h.done ? { backgroundColor: h.color, borderColor: h.color } : { borderColor: 'hsl(var(--border))' }}>
            {h.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
          </div>
          <span className="flex-1 text-xs font-medium">{h.title}</span>
          <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
            <Flame className="h-3 w-3" /> {h.streak}d
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const features = [
  {
    icon: Wallet,
    title: 'Controle financeiro completo',
    description: 'Receitas, despesas, categorias e gráficos. Entenda para onde vai cada real do seu bolso.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Target,
    title: 'Metas com propósito',
    description: 'Defina objetivos pessoais, financeiros, fitness e carreira. Veja seu progresso em tempo real.',
    color: 'from-indigo-500/20 to-indigo-500/5',
    iconColor: 'text-indigo-400',
  },
  {
    icon: Flame,
    title: 'Hábitos que ficam',
    description: 'Construa rotinas com checks diários, foguinho de sequência e calendário de consistência.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
  },
  {
    icon: CheckCircle2,
    title: 'Produtividade sem esforço',
    description: 'Lista de tarefas com prioridades e prazos. Foco em concluir, não só em anotar.',
    color: 'from-sky-500/20 to-sky-500/5',
    iconColor: 'text-sky-400',
  },
  {
    icon: BarChart3,
    title: 'Visão panorâmica',
    description: 'Dashboard unificado com resumo financeiro, hábitos do dia, metas e tarefas pendentes.',
    color: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-400',
  },
  {
    icon: BookOpen,
    title: 'Cofre de recursos',
    description: 'Salve artigos, cursos e vídeos para ver depois. Filtre por categoria e marque como lido.',
    color: 'from-rose-500/20 to-rose-500/5',
    iconColor: 'text-rose-400',
  },
];

const pillars = [
  { icon: ShieldCheck, title: 'Segurança máxima', desc: 'Seus dados protegidos com criptografia de ponta a ponta e autenticação segura.' },
  { icon: Zap, title: 'Velocidade instantânea', desc: 'Interface fluida que responde em milissegundos, sem carregamentos que interrompem seu foco.' },
  { icon: Lock, title: 'Privacidade total', desc: 'Você é dono dos seus dados. Nada é compartilhado ou vendido a terceiros, jamais.' },
];

const steps = [
  { num: '01', title: 'Crie sua conta', desc: 'Cadastro em menos de 1 minuto. Sem cartão de crédito.' },
  { num: '02', title: 'Configure seu perfil', desc: 'Adicione suas finanças, crie metas e defina seus hábitos.' },
  { num: '03', title: 'Evolua todo dia', desc: 'Acompanhe seu progresso no dashboard e sinta a diferença.' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/40">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">LifeOS</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block">
              Entrar
            </Link>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/register">
                Começar grátis
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

        <div className="container relative z-10 text-center">
          <motion.div {...fadeUp(0)}>
            <Badge className="mx-auto mb-6 gap-1.5 px-4 py-1.5 text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              Gratuito · Sem cartão · Começa agora
            </Badge>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="mx-auto max-w-4xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            O painel de controle da{' '}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
              sua vida
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg lg:text-xl">
            Finanças, metas, hábitos e produtividade — reunidos em um único lugar com clareza,
            organização e foco. Pare de gerenciar sua vida em planilhas.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 gap-2 px-8 text-base font-semibold shadow-lg shadow-primary/30">
              <Link href="/register">
                Começar agora — é grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </motion.div>

          <motion.p {...fadeUp(0.3)} className="mt-6 text-xs text-muted-foreground">
            Conta demo disponível:{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">demo@lifeos.app</code>
            {' / '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">demo1234</code>
          </motion.p>

          {/* Floating stats */}
          <motion.div {...fadeUp(0.36)} className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4 sm:max-w-xl">
            {[
              { label: 'Módulos integrados', value: '6+' },
              { label: 'Configuração', value: '< 2min' },
              { label: 'Dados seguros', value: '100%' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── App Mockup Preview ─── */}
      <Section className="container pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo o que você precisa, em um só lugar
          </h2>
          <p className="mt-3 text-muted-foreground">
            Veja como o LifeOS se parece por dentro antes de criar sua conta.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Finanças', icon: Wallet, color: 'text-emerald-400', preview: <FinancePreview /> },
            { title: 'Metas', icon: Target, color: 'text-indigo-400', preview: <GoalsPreview /> },
            { title: 'Hábitos', icon: Flame, color: 'text-amber-400', preview: <HabitsPreview /> },
          ].map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur">
                <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <m.icon className={cn('h-3.5 w-3.5', m.color)} />
                    <span className="text-xs font-medium text-muted-foreground">{m.title}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  {m.preview}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── Features grid ─── */}
      <section className="border-y border-border/40 bg-muted/20 py-20">
        <Section className="container">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo que você precisa para crescer
            </h2>
            <p className="mt-3 text-muted-foreground">
              Cada módulo foi pensado para funcionar de forma integrada, não isolada.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100', f.color)} />
                <div className="relative">
                  <div className={cn('mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted', f.iconColor)}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ─── How it works ─── */}
      <Section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Comece em 3 passos
          </h2>
        </div>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-extrabold text-primary">
                {s.num}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── Trust pillars ─── */}
      <section className="border-t border-border/40 bg-muted/20 py-16">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-3">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <Section className="container py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
          <h2 className="relative text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
            Comece a controlar sua vida{' '}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              hoje mesmo
            </span>
          </h2>
          <p className="relative mt-4 text-muted-foreground sm:text-lg">
            Centenas de decisões melhores começam com clareza sobre onde você está. O LifeOS
            é o primeiro passo.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 gap-2 px-10 text-base font-semibold shadow-lg shadow-primary/30">
              <Link href="/register">
                Criar minha conta grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/40 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="font-medium text-foreground">LifeOS</span>
            <span className="text-border">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Dados protegidos
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Sempre disponível
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
