import type { Metadata, Viewport } from 'next';
import { Inter, Manrope, Lora } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AppearanceProvider, APPEARANCE_INLINE_SCRIPT } from '@/components/appearance-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

// Fontes disponíveis no módulo Configurações > Aparência. Todas ficam
// carregadas e disponíveis como variável CSS; a escolha ativa é aplicada
// via `--font-sans` (ver globals.css `[data-font]`).
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});
const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LifeOS — Painel de controle da sua vida',
    template: '%s · LifeOS',
  },
  description:
    'LifeOS é um painel pessoal completo: finanças, jornada, recursos e produtividade em um só lugar.',
  keywords: ['LifeOS', 'finanças pessoais', 'jornada', 'produtividade', 'investimentos'],
  authors: [{ name: 'LifeOS' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),

  // PWA / App metadata
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LifeOS',
  },
  applicationName: 'LifeOS',
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#6366f1',
    'msapplication-tap-highlight': 'no',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} ${lora.variable}`}
    >
      <head>
        {/* PWA splash / icon links for iOS Safari */}
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon-192.svg" />
        {/* Aplica tema e aparência salvos antes da hidratação, evitando flash */}
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_INLINE_SCRIPT }} />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AppearanceProvider>
            {children}
            <Toaster />
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
