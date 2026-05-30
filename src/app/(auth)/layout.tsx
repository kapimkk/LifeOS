import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left visual panel */}
      <div className="relative hidden overflow-hidden border-r border-border/60 lg:block">
        <div className="absolute inset-0 bg-gradient-mesh opacity-90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">LifeOS</span>
          </Link>
          <div className="space-y-4">
            <h2 className="max-w-md text-balance text-3xl font-semibold leading-tight">
              Organize sua vida com clareza, foco e progresso real.
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Acompanhe finanças, metas, hábitos e jornada em um único painel pensado para te fazer
              evoluir todos os dias.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
