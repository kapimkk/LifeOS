import { z } from 'zod';

import { safeText, safeOptionalText } from '@/lib/zod-sanitize';

export const journeySchema = z.object({
  name: safeText(1, 120, 'Nome obrigatório'),

  description: safeOptionalText(2000),
});

export const journeyStepSchema = z.object({
  journeyId: z.string().min(1),

  title: safeText(1, 200, 'Título obrigatório'),

  description: safeOptionalText(2000),

  url: z

    .string()

    .max(2048)

    .optional()

    .nullable()

    .refine((v) => !v || v.trim() === '' || /^https?:\/\/.+/i.test(v.trim()), {
      message: 'URL inválida',
    }),

  instructor: safeOptionalText(120),

  difficulty: z.coerce.number().int().min(1).max(5).default(1),

  xpReward: z.coerce.number().int().min(1).max(100_000).default(100),

  order: z.coerce.number().int().min(1).max(500).optional(),
});

export type JourneyInput = z.infer<typeof journeySchema>;

export type JourneyStepInput = z.infer<typeof journeyStepSchema>;
