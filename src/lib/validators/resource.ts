import { z } from 'zod';
import { safeText, safeOptionalText } from '@/lib/zod-sanitize';

export const RESOURCE_VAULT_CATEGORIES = ['ESTUDOS', 'LAZER', 'FERRAMENTAS'] as const;

export type ResourceVaultCategory = (typeof RESOURCE_VAULT_CATEGORIES)[number];

export const RESOURCE_VAULT_LABELS: Record<ResourceVaultCategory, string> = {
  ESTUDOS: 'Estudos',
  LAZER: 'Lazer',
  FERRAMENTAS: 'Ferramentas',
};

export const RESOURCE_STATUSES = ['TO_READ', 'IN_PROGRESS', 'DONE', 'ARCHIVED'] as const;

export const resourceSchema = z.object({
  title: safeText(1, 200, 'Informe um título'),
  url: z
    .string()
    .url('URL inválida')
    .max(2000)
    .refine(
      (v) => /^https?:\/\//i.test(v),
      'Apenas URLs com protocolo http:// ou https:// são permitidas',
    ),
  description: safeOptionalText(2000),
  vaultCategory: z.enum(RESOURCE_VAULT_CATEGORIES).default('ESTUDOS'),
  category: safeOptionalText(60).optional().nullable(),
  status: z.enum(RESOURCE_STATUSES).default('TO_READ'),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
