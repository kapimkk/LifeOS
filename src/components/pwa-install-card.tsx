'use client';

import { useEffect, useState } from 'react';
import { Download, LaptopMinimal, MonitorCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Evento `beforeinstallprompt`, ainda não tipado no lib.dom.d.ts do TS. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

/**
 * Card de "Instalar aplicativo" (PWA). Usa o evento `beforeinstallprompt`
 * (Chrome/Edge/navegadores Chromium) para abrir o instalador nativo do
 * navegador e colocar o LifeOS na área de trabalho / tela inicial.
 * Em navegadores sem suporte (Safari, Firefox) o card simplesmente não
 * aparece — não há prompt programático equivalente nesses casos.
 */
export function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      toast.success('LifeOS instalado com sucesso!');
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } finally {
      setInstalling(false);
    }
  }

  if (installed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MonitorCheck className="h-4 w-4 text-success" />
            Aplicativo instalado
          </CardTitle>
          <CardDescription>Você já está usando o LifeOS como aplicativo.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sem o evento capturado, o navegador ainda não ofereceu (ou não suporta)
  // a instalação programática — não mostra um botão que não funcionaria.
  if (!deferredPrompt) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LaptopMinimal className="h-4 w-4 text-muted-foreground" />
          Instalar aplicativo
        </CardTitle>
        <CardDescription>
          Adicione o LifeOS à área de trabalho para abrir como um app, sem precisar do navegador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleInstall} disabled={installing} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Baixar para o computador
        </Button>
      </CardContent>
    </Card>
  );
}
