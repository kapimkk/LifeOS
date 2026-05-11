import Link from 'next/link';
import { ArrowLeft, Home, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex flex-col items-center gap-6">
        {/* Visual */}
        <div className="relative">
          <p className="select-none text-[120px] font-extrabold leading-none tracking-tighter text-muted/30 sm:text-[160px]">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MapPin className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Mensagem */}
        <div className="max-w-sm space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Página não encontrada</h1>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida para outro endereço.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Página inicial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
