'use client';

export type RoutineDensity = 'compact' | 'comfortable' | 'spacious';
export type RoutineWeekStart = 'MONDAY' | 'SUNDAY';

export interface RoutineViewSettings {
  /** Hora inicial exibida na grade (0-23). */
  startHour: number;
  /** Hora final exibida na grade (1-24). */
  endHour: number;
  density: RoutineDensity;
  weekStart: RoutineWeekStart;
}

export const DEFAULT_ROUTINE_VIEW: RoutineViewSettings = {
  startHour: 0,
  endHour: 24,
  density: 'comfortable',
  weekStart: 'MONDAY',
};

export const ROW_HEIGHT_BY_DENSITY: Record<RoutineDensity, number> = {
  compact: 36,
  comfortable: 48,
  spacious: 64,
};

export const DENSITY_LABELS: Record<RoutineDensity, string> = {
  compact: 'Compacta',
  comfortable: 'Confortável',
  spacious: 'Espaçosa',
};

const STORAGE_KEY = 'lifeos:routine-view';

export function readRoutineViewSettings(): RoutineViewSettings {
  if (typeof window === 'undefined') return DEFAULT_ROUTINE_VIEW;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROUTINE_VIEW;
    const parsed = JSON.parse(raw) as Partial<RoutineViewSettings>;
    const startHour =
      typeof parsed.startHour === 'number' && parsed.startHour >= 0 && parsed.startHour <= 23
        ? parsed.startHour
        : DEFAULT_ROUTINE_VIEW.startHour;
    const endHour =
      typeof parsed.endHour === 'number' && parsed.endHour >= 1 && parsed.endHour <= 24
        ? parsed.endHour
        : DEFAULT_ROUTINE_VIEW.endHour;
    return {
      startHour: endHour > startHour ? startHour : DEFAULT_ROUTINE_VIEW.startHour,
      endHour: endHour > startHour ? endHour : DEFAULT_ROUTINE_VIEW.endHour,
      density:
        parsed.density && parsed.density in ROW_HEIGHT_BY_DENSITY
          ? parsed.density
          : DEFAULT_ROUTINE_VIEW.density,
      weekStart: parsed.weekStart === 'SUNDAY' ? 'SUNDAY' : 'MONDAY',
    };
  } catch {
    return DEFAULT_ROUTINE_VIEW;
  }
}

export function saveRoutineViewSettings(settings: RoutineViewSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage indisponível — segue apenas em memória nesta sessão.
  }
}
