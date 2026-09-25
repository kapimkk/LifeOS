import { z } from 'zod';
import { safeOptionalText, safeText } from '@/lib/zod-sanitize';

export const receivableSchema = z.object({
  debtorName: safeText(1, 120, 'Informe quem deve'),
  amount: z
    .number({ invalid_type_error: 'Valor inválido' })
    .positive('Valor deve ser maior que zero')
    .max(1_000_000_000),
  note: safeOptionalText(300),
});

export type ReceivableInput = z.infer<typeof receivableSchema>;
