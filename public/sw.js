// Service worker mínimo do LifeOS.
//
// Existe apenas para satisfazer o critério de instalabilidade de PWA do
// Chrome/Edge (que exige um service worker com handler de `fetch` para
// disparar o evento `beforeinstallprompt`, usado pelo botão "Instalar
// aplicativo" em Configurações > Conta). Não faz cache nem funciona
// offline de propósito — é um passthrough puro para a rede, para não
// arriscar servir conteúdo desatualizado (sessão, saldo, lançamentos etc.
// mudam a todo momento).

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
