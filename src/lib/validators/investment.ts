import { z } from 'zod';

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
  name: z.string().min(1, 'Informe o nome').max(120),
  amount: z
    .number({ invalid_type_error: 'Valor inválido' })
    .nonnegative('Valor não pode ser negativo')
    .max(1_000_000_000),
  type: z.string().min(1, 'Informe o tipo').max(60),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor hex inválida')
    .default('#22c55e'),
  notes: z.string().max(2000).optional().nullable(),
});

export type InvestmentInput = z.infer<typeof investmentSchema>;
