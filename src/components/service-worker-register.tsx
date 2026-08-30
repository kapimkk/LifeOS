'use client';

import { useEffect } from 'react';

/**
 * Registra o service worker (public/sw.js) assim que o app carrega.
 * Necessário para o Chrome/Edge oferecerem a instalação como PWA (ver
 * `PwaInstallCard`) — sem um service worker registrado, o navegador nunca
 * dispara `beforeinstallprompt`.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Falha ao registrar (ex.: navegador sem suporte) — a instalação como
      // app fica indisponível, mas o resto do LifeOS funciona normalmente.
    });
  }, []);

  return null;
}
