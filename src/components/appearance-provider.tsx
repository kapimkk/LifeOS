'use client';

import * as React from 'react';

// ---------------------------------------------------------------------------
// Tipos e opções
// ---------------------------------------------------------------------------
export const ACCENT_COLORS = [
  'indigo',
  'violet',
  'blue',
  'cyan',
  'emerald',
  'amber',
  'rose',
  'red',
  'custom',
] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

export const SECONDARY_COLORS = [
  'neutral',
  'slate',
  'blue',
  'emerald',
  'violet',
  'rose',
  'amber',
  'custom',
] as const;
export type SecondaryColor = (typeof SECONDARY_COLORS)[number];

/** Paleta compartilhada por "Cor de fundo" e "Cor dos cards". */
export const SURFACE_COLORS = [
  'neutral',
  'slate',
  'blue',
  'emerald',
  'violet',
  'rose',
  'amber',
  'custom',
] as const;
export type SurfaceColor = (typeof SURFACE_COLORS)[number];

export const RADIUS_OPTIONS = ['none', 'sm', 'md', 'lg', 'xl'] as const;
export type RadiusOption = (typeof RADIUS_OPTIONS)[number];

export const DENSITY_OPTIONS = ['compact', 'comfortable', 'spacious'] as const;
export type DensityOption = (typeof DENSITY_OPTIONS)[number];

export const FONT_OPTIONS = ['inter', 'manrope', 'lora'] as const;
export type FontOption = (typeof FONT_OPTIONS)[number];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export interface AppearanceSettings {
  accent: AccentColor;
  customAccentHex: string;
  secondary: SecondaryColor;
  customSecondaryHex: string;
  background: SurfaceColor;
  customBackgroundHex: string;
  card: SurfaceColor;
  customCardHex: string;
  radius: RadiusOption;
  density: DensityOption;
  font: FontOption;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  accent: 'indigo',
  customAccentHex: '#6366f1',
  secondary: 'neutral',
  customSecondaryHex: '#64748b',
  background: 'neutral',
  customBackgroundHex: '#64748b',
  card: 'neutral',
  customCardHex: '#64748b',
  radius: 'lg',
  density: 'comfortable',
  font: 'inter',
};

export const STORAGE_KEY = 'lifeos:appearance';

// ---------------------------------------------------------------------------
// Cor personalizada: hex -> HSL (formato "H S% L%" usado nas CSS vars)
// ---------------------------------------------------------------------------
export function hexToHslString(hex: string): string {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Só o matiz (0-360), usado para "tingir" superfícies (fundo/cards) com uma cor
 *  personalizada mantendo saturação/luminosidade fixas e seguras para leitura. */
export function hexToHue(hex: string): number {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return Math.round(h * 360);
}

/** Escolhe texto branco ou escuro sobre `hex` conforme a luminância percebida (YIQ). */
export function contrastForegroundHsl(hex: string): string {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '240 10% 3.9%' : '0 0% 100%';
}

// ---------------------------------------------------------------------------
// Cor de fundo / cards personalizadas — mantém S/L fixos (seguros para
// contraste com --foreground) e só varia o matiz escolhido pelo usuário.
// ---------------------------------------------------------------------------
function backgroundVars(hue: number, isDark: boolean): Record<string, string> {
  const bg = isDark ? `${hue} 20% 5%` : `${hue} 30% 98%`;
  return { '--background': bg, '--sidebar-bg': bg };
}

function cardVars(hue: number, isDark: boolean): Record<string, string> {
  return isDark
    ? {
        '--card': `${hue} 20% 8%`,
        '--popover': `${hue} 20% 8%`,
        '--muted': `${hue} 20% 13%`,
        '--border': `${hue} 18% 17%`,
        '--input': `${hue} 18% 17%`,
        '--sidebar-accent': `${hue} 20% 13%`,
        '--sidebar-border': `${hue} 18% 15%`,
      }
    : {
        '--card': `${hue} 30% 99%`,
        '--popover': `${hue} 30% 99%`,
        '--muted': `${hue} 35% 95%`,
        '--border': `${hue} 25% 89%`,
        '--input': `${hue} 25% 89%`,
        '--sidebar-accent': `${hue} 35% 95%`,
        '--sidebar-border': `${hue} 25% 89%`,
      };
}

// ---------------------------------------------------------------------------
// Aplicação no DOM (compartilhada com o script inline anti-flash em layout.tsx)
// ---------------------------------------------------------------------------
export function applyAppearance(settings: AppearanceSettings) {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');

  root.setAttribute('data-accent', settings.accent);
  root.setAttribute('data-secondary', settings.secondary);
  root.setAttribute('data-background', settings.background);
  root.setAttribute('data-card', settings.card);
  root.setAttribute('data-radius', settings.radius);
  root.setAttribute('data-density', settings.density);
  root.setAttribute('data-font', settings.font);

  if (settings.accent === 'custom' && HEX_RE.test(settings.customAccentHex)) {
    const hsl = hexToHslString(settings.customAccentHex);
    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);
    root.style.setProperty('--primary-foreground', contrastForegroundHsl(settings.customAccentHex));
  } else {
    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--primary-foreground');
  }

  if (settings.secondary === 'custom' && HEX_RE.test(settings.customSecondaryHex)) {
    root.style.setProperty('--secondary', hexToHslString(settings.customSecondaryHex));
    root.style.setProperty(
      '--secondary-foreground',
      contrastForegroundHsl(settings.customSecondaryHex),
    );
  } else {
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--secondary-foreground');
  }

  if (settings.background === 'custom' && HEX_RE.test(settings.customBackgroundHex)) {
    const vars = backgroundVars(hexToHue(settings.customBackgroundHex), isDark);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  } else {
    root.style.removeProperty('--background');
    root.style.removeProperty('--sidebar-bg');
  }

  if (settings.card === 'custom' && HEX_RE.test(settings.customCardHex)) {
    const vars = cardVars(hexToHue(settings.customCardHex), isDark);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  } else {
    for (const k of [
      '--card',
      '--popover',
      '--muted',
      '--border',
      '--input',
      '--sidebar-accent',
      '--sidebar-border',
    ]) {
      root.style.removeProperty(k);
    }
  }
}

function readStoredAppearance(): AppearanceSettings {
  if (typeof window === 'undefined') return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    const parsed = JSON.parse(raw) as Partial<AppearanceSettings>;
    return {
      accent: ACCENT_COLORS.includes(parsed.accent as AccentColor)
        ? (parsed.accent as AccentColor)
        : DEFAULT_APPEARANCE.accent,
      customAccentHex: HEX_RE.test(parsed.customAccentHex ?? '')
        ? (parsed.customAccentHex as string)
        : DEFAULT_APPEARANCE.customAccentHex,
      secondary: SECONDARY_COLORS.includes(parsed.secondary as SecondaryColor)
        ? (parsed.secondary as SecondaryColor)
        : DEFAULT_APPEARANCE.secondary,
      customSecondaryHex: HEX_RE.test(parsed.customSecondaryHex ?? '')
        ? (parsed.customSecondaryHex as string)
        : DEFAULT_APPEARANCE.customSecondaryHex,
      background: SURFACE_COLORS.includes(parsed.background as SurfaceColor)
        ? (parsed.background as SurfaceColor)
        : DEFAULT_APPEARANCE.background,
      customBackgroundHex: HEX_RE.test(parsed.customBackgroundHex ?? '')
        ? (parsed.customBackgroundHex as string)
        : DEFAULT_APPEARANCE.customBackgroundHex,
      card: SURFACE_COLORS.includes(parsed.card as SurfaceColor)
        ? (parsed.card as SurfaceColor)
        : DEFAULT_APPEARANCE.card,
      customCardHex: HEX_RE.test(parsed.customCardHex ?? '')
        ? (parsed.customCardHex as string)
        : DEFAULT_APPEARANCE.customCardHex,
      radius: RADIUS_OPTIONS.includes(parsed.radius as RadiusOption)
        ? (parsed.radius as RadiusOption)
        : DEFAULT_APPEARANCE.radius,
      density: DENSITY_OPTIONS.includes(parsed.density as DensityOption)
        ? (parsed.density as DensityOption)
        : DEFAULT_APPEARANCE.density,
      font: FONT_OPTIONS.includes(parsed.font as FontOption)
        ? (parsed.font as FontOption)
        : DEFAULT_APPEARANCE.font,
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface AppearanceContextValue {
  settings: AppearanceSettings;
  setSetting: <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => void;
  updateSettings: (partial: Partial<AppearanceSettings>) => void;
  reset: () => void;
}

const AppearanceContext = React.createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  // Sincroniza com o que o script inline já aplicou no <html> antes da hidratação.
  React.useEffect(() => {
    setSettings(readStoredAppearance());
  }, []);

  React.useEffect(() => {
    applyAppearance(settings);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage indisponível (modo privado, quota etc.) — segue apenas em memória.
    }
  }, [settings]);

  // Reaplica cor de fundo/cards personalizada ao trocar claro/escuro — o
  // matiz custom depende de S/L diferentes por tema (ver `backgroundVars`).
  React.useEffect(() => {
    const observer = new MutationObserver(() => applyAppearance(settings));
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [settings]);

  const setSetting = React.useCallback(
    <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateSettings = React.useCallback((partial: Partial<AppearanceSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = React.useCallback(() => setSettings(DEFAULT_APPEARANCE), []);

  const value = React.useMemo(
    () => ({ settings, setSetting, updateSettings, reset }),
    [settings, setSetting, updateSettings, reset],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const ctx = React.useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance deve ser usado dentro de <AppearanceProvider>');
  return ctx;
}

/**
 * Script inline síncrono (executado no <head>, antes da hidratação) que lê
 * as preferências salvas e aplica os atributos data-* (e cores personalizadas)
 * no <html> imediatamente, evitando o "flash" da aparência padrão a cada
 * carregamento de página. Mesma técnica usada pelo next-themes para o tema.
 */
export const APPEARANCE_INLINE_SCRIPT = `
(function () {
  try {
    var raw = window.localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var s = raw ? JSON.parse(raw) : {};
    var HEX_RE = /^#[0-9a-fA-F]{6}$/;
    var accent = ${JSON.stringify(ACCENT_COLORS)}.indexOf(s.accent) > -1 ? s.accent : ${JSON.stringify(DEFAULT_APPEARANCE.accent)};
    var secondary = ${JSON.stringify(SECONDARY_COLORS)}.indexOf(s.secondary) > -1 ? s.secondary : ${JSON.stringify(DEFAULT_APPEARANCE.secondary)};
    var background = ${JSON.stringify(SURFACE_COLORS)}.indexOf(s.background) > -1 ? s.background : ${JSON.stringify(DEFAULT_APPEARANCE.background)};
    var card = ${JSON.stringify(SURFACE_COLORS)}.indexOf(s.card) > -1 ? s.card : ${JSON.stringify(DEFAULT_APPEARANCE.card)};
    var radius = ${JSON.stringify(RADIUS_OPTIONS)}.indexOf(s.radius) > -1 ? s.radius : ${JSON.stringify(DEFAULT_APPEARANCE.radius)};
    var density = ${JSON.stringify(DENSITY_OPTIONS)}.indexOf(s.density) > -1 ? s.density : ${JSON.stringify(DEFAULT_APPEARANCE.density)};
    var font = ${JSON.stringify(FONT_OPTIONS)}.indexOf(s.font) > -1 ? s.font : ${JSON.stringify(DEFAULT_APPEARANCE.font)};
    var customAccentHex = HEX_RE.test(s.customAccentHex) ? s.customAccentHex : ${JSON.stringify(DEFAULT_APPEARANCE.customAccentHex)};
    var customSecondaryHex = HEX_RE.test(s.customSecondaryHex) ? s.customSecondaryHex : ${JSON.stringify(DEFAULT_APPEARANCE.customSecondaryHex)};
    var customBackgroundHex = HEX_RE.test(s.customBackgroundHex) ? s.customBackgroundHex : ${JSON.stringify(DEFAULT_APPEARANCE.customBackgroundHex)};
    var customCardHex = HEX_RE.test(s.customCardHex) ? s.customCardHex : ${JSON.stringify(DEFAULT_APPEARANCE.customCardHex)};

    function hexToHsl(hex) {
      var n = parseInt(hex.replace('#', ''), 16);
      var r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s2 = 0, l = (max + min) / 2;
      if (max !== min) {
        var d = max - min;
        s2 = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
      }
      return Math.round(h * 360) + ' ' + Math.round(s2 * 100) + '% ' + Math.round(l * 100) + '%';
    }
    function hexToHue(hex) {
      var n = parseInt(hex.replace('#', ''), 16);
      var r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0;
      if (max !== min) {
        var d = max - min;
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
      }
      return Math.round(h * 360);
    }
    function contrastFg(hex) {
      var n = parseInt(hex.replace('#', ''), 16);
      var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      var yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 150 ? '240 10% 3.9%' : '0 0% 100%';
    }

    var root = document.documentElement;
    // O modo (claro/escuro) já foi decidido pelo script do next-themes, que
    // roda antes deste e também via atributo suppressHydrationWarning.
    var isDark = root.classList.contains('dark');

    root.setAttribute('data-accent', accent);
    root.setAttribute('data-secondary', secondary);
    root.setAttribute('data-background', background);
    root.setAttribute('data-card', card);
    root.setAttribute('data-radius', radius);
    root.setAttribute('data-density', density);
    root.setAttribute('data-font', font);

    if (accent === 'custom') {
      root.style.setProperty('--primary', hexToHsl(customAccentHex));
      root.style.setProperty('--ring', hexToHsl(customAccentHex));
      root.style.setProperty('--primary-foreground', contrastFg(customAccentHex));
    }
    if (secondary === 'custom') {
      root.style.setProperty('--secondary', hexToHsl(customSecondaryHex));
      root.style.setProperty('--secondary-foreground', contrastFg(customSecondaryHex));
    }
    if (background === 'custom') {
      var bh = hexToHue(customBackgroundHex);
      var bg = isDark ? (bh + ' 20% 5%') : (bh + ' 30% 98%');
      root.style.setProperty('--background', bg);
      root.style.setProperty('--sidebar-bg', bg);
    }
    if (card === 'custom') {
      var ch = hexToHue(customCardHex);
      if (isDark) {
        root.style.setProperty('--card', ch + ' 20% 8%');
        root.style.setProperty('--popover', ch + ' 20% 8%');
        root.style.setProperty('--muted', ch + ' 20% 13%');
        root.style.setProperty('--border', ch + ' 18% 17%');
        root.style.setProperty('--input', ch + ' 18% 17%');
        root.style.setProperty('--sidebar-accent', ch + ' 20% 13%');
        root.style.setProperty('--sidebar-border', ch + ' 18% 15%');
      } else {
        root.style.setProperty('--card', ch + ' 30% 99%');
        root.style.setProperty('--popover', ch + ' 30% 99%');
        root.style.setProperty('--muted', ch + ' 35% 95%');
        root.style.setProperty('--border', ch + ' 25% 89%');
        root.style.setProperty('--input', ch + ' 25% 89%');
        root.style.setProperty('--sidebar-accent', ch + ' 35% 95%');
        root.style.setProperty('--sidebar-border', ch + ' 25% 89%');
      }
    }
  } catch (e) {}
})();
`;
