import { z } from 'zod';
import { safeText } from '@/lib/zod-sanitize';

export const fixedExpenseSchema = z.object({
  name: safeText(1, 120, 'Informe o nome'),
  amount: z
    .number({ invalid_type_error: 'Valor inválido' })
    .positive('Valor deve ser maior que zero')
    .max(1_000_000_000),
  dueDate: z
    .number({ invalid_type_error: 'Dia inválido' })
    .int('Use um dia inteiro')
    .min(1, 'Dia mínimo: 1')
    .max(31, 'Dia máximo: 31'),
});

export type FixedExpenseInput = z.infer<typeof fixedExpenseSchema>;
