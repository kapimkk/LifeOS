import { z } from 'zod';

export const paymentMethodSchema = z.enum(['CASH', 'CREDIT_CARD', 'DEBIT', 'PIX']);

export const transactionFieldsSchema = z.object({
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
  paymentMethod: paymentMethodSchema.default('CASH'),
  installments: z.coerce.number().int().min(1).max(60).default(1),
});

export const transactionSchema = transactionFieldsSchema.superRefine((data, ctx) => {
  if (data.type === 'INCOME') {
    if (data.paymentMethod === 'CREDIT_CARD') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Receitas não podem usar cartão de crédito',
        path: ['paymentMethod'],
      });
    }
    if (data.installments > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Receitas não podem ser parceladas',
        path: ['installments'],
      });
    }
  }
  if (data.paymentMethod !== 'CREDIT_CARD' && data.installments > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Parcelamento só é permitido no cartão de crédito',
      path: ['installments'],
    });
  }
});

/** PATCH / transações parciais — validação alinhada quando os campos vierem no corpo. */
export const transactionPatchSchema = transactionFieldsSchema.partial().superRefine((data, ctx) => {
  if (data.type === 'INCOME') {
    if (data.paymentMethod === 'CREDIT_CARD') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Receitas não podem usar cartão de crédito',
        path: ['paymentMethod'],
      });
    }
    if (data.installments !== undefined && data.installments > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Receitas não podem ser parceladas',
        path: ['installments'],
      });
    }
  }
  if (
    data.paymentMethod !== undefined &&
    data.paymentMethod !== 'CREDIT_CARD' &&
    data.installments !== undefined &&
    data.installments > 1
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Parcelamento só é permitido no cartão de crédito',
      path: ['installments'],
    });
  }
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().min(1).max(60),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor hex inválida')
    .default('#6366f1'),
  icon: z.string().max(40).optional().nullable(),
  type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
});
export type CategoryInput = z.infer<typeof categorySchema>;
