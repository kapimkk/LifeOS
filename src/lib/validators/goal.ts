import { z } from 'zod';
import { safeText, safeOptionalText } from '@/lib/zod-sanitize';

export const goalSchema = z.object({
  title: safeText(1, 120),
  description: safeOptionalText(2000),
  category: z
    .enum(['FINANCIAL', 'PERSONAL', 'STUDIES', 'FITNESS', 'CAREER', 'OTHER'])
    .default('PERSONAL'),
  targetValue: z.number().positive().optional().nullable(),
  currentValue: z.number().nonnegative().default(0),
  progress: z.number().int().min(0).max(100).default(0),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED']).default('ACTIVE'),
  deadline: z.union([z.string(), z.date()]).optional().nullable(),
});
export type GoalInput = z.infer<typeof goalSchema>;
