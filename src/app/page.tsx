import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Flame,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Wallet,
    title: 'Controle financeiro completo',
    description:
      'Cadastre receitas, despesas, categorias e recorrências. Visualize seu saldo e gastos com gráficos profissionais.',
  },
  {
    icon: Target,
    title: 'Metas com progresso real',
    description:
      'Defina metas pessoais, financeiras, de estudo, fitness e carreira. Acompanhe % de evolução e prioridade.',
  },
  {
    icon: Flame,
    title: 'Hábitos e streaks',
    description:
      'Construa rotinas saudáveis com checks diários, calendário visual e acompanhamento de consistência.',
  },
  {
    icon: CheckCircle2,
    title: 'Tarefas e produtividade',
    description:
      'Organize sua semana com listas, prioridades e prazos. Foco em concluir, não só anotar.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard único',
    description:
      'Veja tudo em um só lugar: resumo financeiro, hábitos do dia, metas ativas, evolução semanal e tarefas.',
  },
  {
    icon: Sparkles,
    title: 'Design premium',
    description:
      'UI moderna, dark mode, animações suaves. Inspirado em Notion, Linear e Stripe.',
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-60" />

      <header className="relative z-10 border-b border-border/40 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">LifeOS</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Button asChild size="sm">
              <Link href="/register">
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative z-10 container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="default" className="mx-auto mb-6">
            <Sparkles className="mr-1 h-3 w-3" />
            Versão 0.1 · MVP
          </Badge>
          <h1 className="text-balance text-5xl font-bold tracking-tight md:text-7xl">
            O painel de controle da{' '}
            <span className="bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent">
              sua vida
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            Finanças, metas, hábitos, rotina e produtividade em um único lugar — com clareza,
            organização e foco.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/register">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Demo: <code className="rounded bg-muted px-1.5 py-0.5">demo@lifeos.app</code> /{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">demo1234</code>
          </p>
        </div>
      </section>

      <section className="relative z-10 container pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40 py-8">
        <div className="container flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} LifeOS</span>
          <span>Construído com Next.js 15 · Prisma · TailwindCSS</span>
        </div>
      </footer>
    </main>
  );
}
