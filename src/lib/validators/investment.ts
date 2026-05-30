import { z } from 'zod';
import { safeText, safeOptionalText } from '@/lib/zod-sanitize';

export const INVESTMENT_TYPES = [
  'CDB',
  'Tesouro Direto',
  'LCI/LCA',
  'Ações',
  'FIIs',
  'ETFs',
  'Cripto',
  'Renda Fixa',
  'Renda Variável',
  'Previdência',
  'Outros',
] as const;

export const investmentSchema = z.object({
  name: safeText(1, 120, 'Informe o nome'),
  amount: z
    .number({ invalid_type_error: 'Valor inválido' })
    .nonnegative('Valor não pode ser negativo')
    .max(1_000_000_000),
  type: safeText(1, 60, 'Informe o tipo'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor hex inválida')
    .default('#22c55e'),
  notes: safeOptionalText(2000),
});

export type InvestmentInput = z.infer<typeof investmentSchema>;
