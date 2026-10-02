import { z } from 'zod';
import { safeOptionalText, safeText } from '@/lib/zod-sanitize';

export const fixedReceivableSchema = z.object({
  name: safeText(1, 120, 'Informe a origem'),
  amount: z
    .number({ invalid_type_error: 'Valor inválido' })
    .positive('Valor deve ser maior que zero')
    .max(1_000_000_000),
  dueDay: z
    .number({ invalid_type_error: 'Dia inválido' })
    .int('Use um dia inteiro')
    .min(1, 'Dia mínimo: 1')
    .max(31, 'Dia máximo: 31'),
  note: safeOptionalText(300),
});

export const fixedReceivableMonthSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  paid: z.boolean(),
});

export type FixedReceivableInput = z.infer<typeof fixedReceivableSchema>;
export type FixedReceivableMonthInput = z.infer<typeof fixedReceivableMonthSchema>;
