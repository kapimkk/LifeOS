import { z } from 'zod';

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
  title: z.string().min(1, 'Informe um título').max(200),
  url: z
    .string()
    .url('URL inválida')
    .max(2000)
    .refine(
      (v) => /^https?:\/\//i.test(v),
      'Apenas URLs com protocolo http:// ou https:// são permitidas',
    ),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  status: z.enum(RESOURCE_STATUSES).default('TO_READ'),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
