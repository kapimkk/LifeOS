import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z
    .number({ invalid_type_error: 'Valor inválido' })
    .positive('Valor deve ser positivo')
    .max(1_000_000_000),
  description: z.string().min(1, 'Descrição obrigatória').max(200),
  notes: z.string().max(1000).optional().nullable(),
  categoryId: z.string().min(1).optional().nullable(),
  date: z.union([z.string(), z.date()]),
  recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).default('NONE'),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor hex inválida').default('#6366f1'),
  icon: z.string().max(40).optional().nullable(),
  type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
});
export type CategoryInput = z.infer<typeof categorySchema>;
