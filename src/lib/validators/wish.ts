import { z } from 'zod';
import { safeText, safeOptionalText } from '@/lib/zod-sanitize';

export const WISH_CATEGORIES = ['ASSINATURAS', 'ELETRONICOS', 'JOGOS', 'LAZER'] as const;

export type WishCategory = (typeof WISH_CATEGORIES)[number];

export const WISH_CATEGORY_LABELS: Record<WishCategory, string> = {
  ASSINATURAS: 'Assinaturas',
  ELETRONICOS: 'Eletrônicos',
  JOGOS: 'Jogos',
  LAZER: 'Lazer',
};

export const wishSchema = z.object({
  name: safeText(1, 200, 'Informe o nome do desejo'),
  price: z
    .number({ invalid_type_error: 'Preço inválido' })
    .nonnegative('Preço não pode ser negativo')
    .max(1_000_000_000),
  link: z.string().url('URL inválida').max(2000).optional().nullable().or(z.literal('')),
  description: safeOptionalText(2000),
  category: z.enum(WISH_CATEGORIES).default('ELETRONICOS'),
});

export type WishInput = z.infer<typeof wishSchema>;
