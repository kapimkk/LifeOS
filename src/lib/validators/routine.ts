import { z } from 'zod';
import { safeText, safeOptionalText } from '@/lib/zod-sanitize';

export const WEEK_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export const WEEK_DAY_SHORT: Record<WeekDay, string> = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

/** Categorias sugeridas no formulário — o campo aceita texto livre no backend
 * (mesmo padrão de `INVESTMENT_TYPES`), então isso é só o preset da UI. */
export const ROUTINE_CATEGORIES = [
  'Trabalho',
  'Estudos',
  'Saúde',
  'Exercício',
  'Sono',
  'Alimentação',
  'Lazer',
  'Casa',
  'Social',
  'Outro',
] as const;

export type RoutineCategory = (typeof ROUTINE_CATEGORIES)[number];

/** Cor padrão sugerida por categoria (o usuário pode trocar livremente). */
export const ROUTINE_CATEGORY_COLORS: Record<RoutineCategory, string> = {
  Trabalho: '#6366f1',
  Estudos: '#06b6d4',
  Saúde: '#22c55e',
  Exercício: '#f97316',
  Sono: '#8b5cf6',
  Alimentação: '#eab308',
  Lazer: '#ec4899',
  Casa: '#14b8a6',
  Social: '#f43f5e',
  Outro: '#64748b',
};

const routineItemBase = z.object({
  day: z.enum(WEEK_DAYS),
  startMinute: z.number({ invalid_type_error: 'Informe o horário inicial' }).int().min(0).max(1439),
  endMinute: z.number({ invalid_type_error: 'Informe o horário final' }).int().min(1).max(1440),
  title: safeText(1, 120, 'Informe o título'),
  description: safeOptionalText(500),
  category: safeText(1, 40, 'Informe a categoria').default('Outro'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor hex inválida')
    .default('#6366f1'),
});

export const routineItemSchema = routineItemBase.refine((d) => d.endMinute > d.startMinute, {
  message: 'O horário final deve ser depois do inicial',
  path: ['endMinute'],
});

export type RoutineItemInput = z.infer<typeof routineItemBase>;

/** hh:mm -> minutos desde 00:00. */
export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

/** minutos desde 00:00 -> hh:mm. */
export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
