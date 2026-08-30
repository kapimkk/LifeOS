'use client';

import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Check,
  Laptop,
  Moon,
  Pipette,
  RotateCcw,
  Save,
  Sun,
  Type as TypeIcon,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ACCENT_COLORS,
  DENSITY_OPTIONS,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  SECONDARY_COLORS,
  SURFACE_COLORS,
  contrastForegroundHsl,
  hexToHslString,
  hexToHue,
  useAppearance,
  type AccentColor,
  type AppearanceSettings,
  type DensityOption,
  type FontOption,
  type RadiusOption,
  type SecondaryColor,
  type SurfaceColor,
} from '@/components/appearance-provider';
import { PwaInstallCard } from '@/components/pwa-install-card';

// ---------------------------------------------------------------------------
// Metadados de exibição das opções
// ---------------------------------------------------------------------------
const ACCENT_META: Record<Exclude<AccentColor, 'custom'>, { label: string; swatch: string }> = {
  indigo: { label: 'Índigo', swatch: 'bg-[hsl(244,75%,57%)]' },
  violet: { label: 'Violeta', swatch: 'bg-[hsl(262,83%,58%)]' },
  blue: { label: 'Azul', swatch: 'bg-[hsl(221,83%,53%)]' },
  cyan: { label: 'Ciano', swatch: 'bg-[hsl(192,91%,36%)]' },
  emerald: { label: 'Esmeralda', swatch: 'bg-[hsl(152,76%,36%)]' },
  amber: { label: 'Âmbar', swatch: 'bg-[hsl(32,95%,44%)]' },
  rose: { label: 'Rosa', swatch: 'bg-[hsl(347,77%,50%)]' },
  red: { label: 'Vermelho', swatch: 'bg-[hsl(0,72%,51%)]' },
};

const SECONDARY_META: Record<
  Exclude<SecondaryColor, 'custom'>,
  { label: string; swatch: string }
> = {
  neutral: { label: 'Neutro', swatch: 'bg-[hsl(240,5%,65%)]' },
  slate: { label: 'Ardósia', swatch: 'bg-[hsl(215,20%,55%)]' },
  blue: { label: 'Azul', swatch: 'bg-[hsl(217,60%,55%)]' },
  emerald: { label: 'Esmeralda', swatch: 'bg-[hsl(152,45%,45%)]' },
  violet: { label: 'Violeta', swatch: 'bg-[hsl(262,45%,55%)]' },
  rose: { label: 'Rosa', swatch: 'bg-[hsl(350,55%,60%)]' },
  amber: { label: 'Âmbar', swatch: 'bg-[hsl(38,60%,55%)]' },
};

const RADIUS_META: Record<RadiusOption, { label: string; rounded: string }> = {
  none: { label: 'Reto', rounded: 'rounded-none' },
  sm: { label: 'Sutil', rounded: 'rounded-sm' },
  md: { label: 'Suave', rounded: 'rounded-md' },
  lg: { label: 'Padrão', rounded: 'rounded-lg' },
  xl: { label: 'Arredondado', rounded: 'rounded-xl' },
};

const DENSITY_META: Record<DensityOption, { label: string; description: string }> = {
  compact: { label: 'Compacta', description: 'Mais conteúdo visível, espaçamento reduzido' },
  comfortable: { label: 'Confortável', description: 'Equilíbrio entre espaço e densidade' },
  spacious: { label: 'Espaçosa', description: 'Textos e espaçamentos maiores' },
};

const FONT_META: Record<FontOption, { label: string; sample: string; className: string }> = {
  inter: { label: 'Inter', sample: 'Aa', className: 'font-[family-name:var(--font-inter)]' },
  manrope: {
    label: 'Manrope',
    sample: 'Aa',
    className: 'font-[family-name:var(--font-manrope)]',
  },
  lora: { label: 'Lora', sample: 'Aa', className: 'font-[family-name:var(--font-lora)]' },
};

const SURFACE_META: Record<Exclude<SurfaceColor, 'custom'>, { label: string; swatch: string }> = {
  neutral: { label: 'Neutro', swatch: 'bg-[hsl(240,5%,75%)]' },
  slate: { label: 'Ardósia', swatch: 'bg-[hsl(215,20%,70%)]' },
  blue: { label: 'Azul', swatch: 'bg-[hsl(217,45%,72%)]' },
  emerald: { label: 'Esmeralda', swatch: 'bg-[hsl(152,35%,65%)]' },
  violet: { label: 'Violeta', swatch: 'bg-[hsl(262,35%,72%)]' },
  rose: { label: 'Rosa', swatch: 'bg-[hsl(350,40%,75%)]' },
  amber: { label: 'Âmbar', swatch: 'bg-[hsl(38,50%,70%)]' },
};

interface AccountInfo {
  name: string;
  email: string;
  role: string;
  currency: string;
  locale: string;
  timezone: string;
  memberSince: string | null;
}

export function SettingsClient({ account }: { account: AccountInfo }) {
  return (
    <Tabs defaultValue="aparencia" className="w-full">
      <TabsList>
        <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        <TabsTrigger value="conta">Conta</TabsTrigger>
      </TabsList>

      <TabsContent value="aparencia" className="space-y-6">
        <AppearanceSettings />
      </TabsContent>

      <TabsContent value="conta">
        <AccountSettings account={account} />
      </TabsContent>
    </Tabs>
  );
}

// ---------------------------------------------------------------------------
// Seletor de cor personalizada (usado tanto para destaque quanto secundária)
// ---------------------------------------------------------------------------
function CustomColorSwatch({
  hex,
  active,
  label,
  onPick,
}: {
  hex: string;
  active: boolean;
  label: string;
  onPick: (hex: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
            active ? 'ring-foreground' : 'ring-transparent',
          )}
          style={{
            background: active
              ? hex
              : 'conic-gradient(from 180deg, #f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e)',
          }}
        />
        <span className="pointer-events-none relative z-10 flex items-center justify-center">
          {active ? (
            <Check className="h-4 w-4 text-white drop-shadow" />
          ) : (
            <Pipette className="h-3.5 w-3.5 text-white drop-shadow" />
          )}
        </span>
        <input
          type="color"
          value={hex}
          onChange={(e) => onPick(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer rounded-full opacity-0"
          aria-label={label}
        />
      </span>
      <span className="text-[10px] text-muted-foreground">Personalizado</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Aparência
// ---------------------------------------------------------------------------
function AppearanceSettings() {
  const { settings: applied, updateSettings: applyChanges, reset: resetApplied } = useAppearance();
  const [settings, setDraftState] = useState<AppearanceSettings>(applied);

  // Mantém o rascunho sincronizado com o que está de fato aplicado (na
  // hidratação inicial e sempre que "Salvar"/"Restaurar padrões" mudam o
  // valor aplicado por fora deste componente).
  useEffect(() => {
    setDraftState(applied);
  }, [applied]);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(applied),
    [settings, applied],
  );

  const setSetting = useCallback(
    <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
      setDraftState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );
  const updateSettings = useCallback((partial: Partial<AppearanceSettings>) => {
    setDraftState((prev) => ({ ...prev, ...partial }));
  }, []);

  function handleSave() {
    applyChanges(settings);
    toast.success('Aparência salva e aplicada em todo o LifeOS.');
  }
  function handleDiscard() {
    setDraftState(applied);
  }
  function handleReset() {
    resetApplied();
    toast.success('Aparência restaurada para o padrão.');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div className="space-y-6">
        <ThemeCard />

        <Card>
          <CardHeader>
            <CardTitle>Cor de destaque</CardTitle>
            <CardDescription>
              Cor primária: usada em botões, links e destaques em todo o LifeOS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-9">
              {ACCENT_COLORS.filter((a) => a !== 'custom').map((accent) => {
                const meta = ACCENT_META[accent as Exclude<AccentColor, 'custom'>];
                const active = settings.accent === accent;
                return (
                  <button
                    key={accent}
                    type="button"
                    onClick={() => setSetting('accent', accent)}
                    className="flex flex-col items-center gap-1.5"
                    aria-pressed={active}
                    aria-label={meta.label}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
                        meta.swatch,
                        active ? 'ring-foreground' : 'ring-transparent hover:ring-border',
                      )}
                    >
                      {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                  </button>
                );
              })}
              <CustomColorSwatch
                hex={settings.customAccentHex}
                active={settings.accent === 'custom'}
                label="Escolher cor de destaque personalizada"
                onPick={(hex) => updateSettings({ accent: 'custom', customAccentHex: hex })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cor secundária</CardTitle>
            <CardDescription>
              Usada em botões e badges de menor ênfase (ação secundária).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {SECONDARY_COLORS.filter((s) => s !== 'custom').map((secondary) => {
                const meta = SECONDARY_META[secondary as Exclude<SecondaryColor, 'custom'>];
                const active = settings.secondary === secondary;
                return (
                  <button
                    key={secondary}
                    type="button"
                    onClick={() => setSetting('secondary', secondary)}
                    className="flex flex-col items-center gap-1.5"
                    aria-pressed={active}
                    aria-label={meta.label}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
                        meta.swatch,
                        active ? 'ring-foreground' : 'ring-transparent hover:ring-border',
                      )}
                    >
                      {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                  </button>
                );
              })}
              <CustomColorSwatch
                hex={settings.customSecondaryHex}
                active={settings.secondary === 'custom'}
                label="Escolher cor secundária personalizada"
                onPick={(hex) => updateSettings({ secondary: 'custom', customSecondaryHex: hex })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cor de fundo</CardTitle>
            <CardDescription>Matiz do fundo da página e da barra lateral.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {SURFACE_COLORS.filter((s) => s !== 'custom').map((bg) => {
                const meta = SURFACE_META[bg as Exclude<SurfaceColor, 'custom'>];
                const active = settings.background === bg;
                return (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setSetting('background', bg)}
                    className="flex flex-col items-center gap-1.5"
                    aria-pressed={active}
                    aria-label={meta.label}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
                        meta.swatch,
                        active ? 'ring-foreground' : 'ring-transparent hover:ring-border',
                      )}
                    >
                      {active && <Check className="h-4 w-4 text-foreground drop-shadow" />}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                  </button>
                );
              })}
              <CustomColorSwatch
                hex={settings.customBackgroundHex}
                active={settings.background === 'custom'}
                label="Escolher cor de fundo personalizada"
                onPick={(hex) => updateSettings({ background: 'custom', customBackgroundHex: hex })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cor dos cards</CardTitle>
            <CardDescription>Matiz de cards, campos, bordas e menus flutuantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {SURFACE_COLORS.filter((s) => s !== 'custom').map((card) => {
                const meta = SURFACE_META[card as Exclude<SurfaceColor, 'custom'>];
                const active = settings.card === card;
                return (
                  <button
                    key={card}
                    type="button"
                    onClick={() => setSetting('card', card)}
                    className="flex flex-col items-center gap-1.5"
                    aria-pressed={active}
                    aria-label={meta.label}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-all',
                        meta.swatch,
                        active ? 'ring-foreground' : 'ring-transparent hover:ring-border',
                      )}
                    >
                      {active && <Check className="h-4 w-4 text-foreground drop-shadow" />}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                  </button>
                );
              })}
              <CustomColorSwatch
                hex={settings.customCardHex}
                active={settings.card === 'custom'}
                label="Escolher cor dos cards personalizada"
                onPick={(hex) => updateSettings({ card: 'custom', customCardHex: hex })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estilo dos cantos</CardTitle>
            <CardDescription>Controla o arredondamento de cards, botões e campos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {RADIUS_OPTIONS.map((radius) => {
                const meta = RADIUS_META[radius];
                const active = settings.radius === radius;
                return (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setSetting('radius', radius)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border/60 hover:border-border',
                    )}
                    aria-pressed={active}
                  >
                    <span className={cn('h-8 w-8 border-2 border-foreground/70', meta.rounded)} />
                    <span className="text-[11px] font-medium">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Densidade da interface</CardTitle>
            <CardDescription>Ajusta a escala de textos e espaçamentos do site.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {DENSITY_OPTIONS.map((density) => {
                const meta = DENSITY_META[density];
                const active = settings.density === density;
                return (
                  <button
                    key={density}
                    type="button"
                    onClick={() => setSetting('density', density)}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border/60 hover:border-border',
                    )}
                    aria-pressed={active}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{meta.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fonte</CardTitle>
            <CardDescription>Tipografia usada em todo o site.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {FONT_OPTIONS.map((font) => {
                const meta = FONT_META[font];
                const active = settings.font === font;
                return (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setSetting('font', font)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border/60 hover:border-border',
                    )}
                    aria-pressed={active}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-base',
                        meta.className,
                      )}
                    >
                      {meta.sample}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{meta.label}</span>
                    </span>
                    {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isDirty ? (
              <>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                Você tem alterações não salvas.
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                Tudo salvo e aplicado.
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar padrões
            </Button>
            {isDirty && (
              <Button variant="outline" size="sm" onClick={handleDiscard}>
                Descartar
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={!isDirty} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Salvar alterações
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <PreviewPanel settings={settings} />
      </div>
    </div>
  );
}

function ThemeCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options: { value: string; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Laptop },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tema</CardTitle>
        <CardDescription>Escolha como o LifeOS deve aparecer no seu dispositivo.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {options.map((opt) => {
            const active = mounted && theme === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                  active ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-border',
                )}
                aria-pressed={active}
              >
                <Icon
                  className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')}
                />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Renderiza a prévia com as cores/estilo do RASCUNHO (ainda não salvo),
 * isolada do resto da página: os atributos data-* aqui replicam, só neste
 * card, as mesmas regras CSS que o AppearanceProvider aplica em <html> (ver
 * globals.css `[data-accent]`/`[data-secondary]`/etc.), sem tocar no tema
 * já aplicado ao site enquanto o usuário não clicar em "Salvar alterações".
 */
function PreviewPanel({ settings }: { settings: AppearanceSettings }) {
  const { resolvedTheme } = useTheme();
  // `resolvedTheme` só existe no cliente (next-themes retorna undefined no
  // SSR); só usamos o valor real depois de montado para não gerar mismatch
  // de hidratação (mesmo padrão do `ThemeCard` acima).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const customVars: Record<string, string> = {};
  if (settings.accent === 'custom') {
    const hsl = hexToHslString(settings.customAccentHex);
    customVars['--primary'] = hsl;
    customVars['--ring'] = hsl;
    customVars['--primary-foreground'] = contrastForegroundHsl(settings.customAccentHex);
  }
  if (settings.secondary === 'custom') {
    const hsl = hexToHslString(settings.customSecondaryHex);
    customVars['--secondary'] = hsl;
    customVars['--secondary-foreground'] = contrastForegroundHsl(settings.customSecondaryHex);
  }
  if (settings.background === 'custom') {
    const h = hexToHue(settings.customBackgroundHex);
    customVars['--background'] = isDark ? `${h} 20% 5%` : `${h} 30% 98%`;
  }
  if (settings.card === 'custom') {
    const h = hexToHue(settings.customCardHex);
    customVars['--card'] = isDark ? `${h} 20% 8%` : `${h} 30% 99%`;
    customVars['--muted'] = isDark ? `${h} 20% 13%` : `${h} 35% 95%`;
    customVars['--border'] = isDark ? `${h} 18% 17%` : `${h} 25% 89%`;
  }

  return (
    <Card
      className={cn('overflow-hidden', isDark && 'dark')}
      data-accent={settings.accent}
      data-secondary={settings.secondary}
      data-background={settings.background}
      data-card={settings.card}
      data-radius={settings.radius}
      data-font={settings.font}
      style={customVars as React.CSSProperties}
    >
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="ml-2 flex items-center gap-1.5">
          <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Pré-visualização</span>
        </div>
      </div>
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="text-sm font-semibold">Painel de finanças</p>
          <p className="text-xs text-muted-foreground">
            Assim os elementos do LifeOS vão aparecer com suas preferências.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Wallet className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 font-medium">Salário</span>
          <span className="font-semibold text-emerald-500">+8.500</span>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 font-medium">Investimentos</span>
          <div className="flex items-center gap-1.5">
            <Badge>+12%</Badge>
            <Badge variant="secondary">Ações</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm">Novo lançamento</Button>
          <Button size="sm" variant="secondary">
            Ver tudo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Conta
// ---------------------------------------------------------------------------
function AccountSettings({ account }: { account: AccountInfo }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Nome', value: account.name },
    { label: 'E-mail', value: account.email },
    { label: 'Papel', value: account.role === 'ADMIN' ? 'Administrador' : 'Usuário' },
    { label: 'Moeda', value: account.currency },
    { label: 'Idioma', value: account.locale },
    { label: 'Fuso horário', value: account.timezone },
  ];
  if (account.memberSince) {
    rows.push({ label: 'Membro desde', value: account.memberSince });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da conta</CardTitle>
          <CardDescription>Informações associadas ao seu login no LifeOS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row, i) => (
            <div key={row.label}>
              <div className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
              {i < rows.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <PwaInstallCard />
    </div>
  );
}
