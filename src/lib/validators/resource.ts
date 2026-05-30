import { z } from 'zod';
import { safeText, safeOptionalText } from '@/lib/zod-sanitize';

export const RESOURCE_CATEGORIES = [
  'Artigo',
  'Vídeo',
  'Curso',
  'Livro',
  'Podcast',
  'Documentação',
  'Tutorial',
  'Ferramenta',
  'Outros',
] as const;

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
  category: safeOptionalText(60),
  status: z.enum(RESOURCE_STATUSES).default('TO_READ'),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
