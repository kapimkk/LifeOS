import { z } from 'zod';

export const goalSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(['FINANCIAL', 'PERSONAL', 'STUDIES', 'FITNESS', 'CAREER', 'OTHER']).default('PERSONAL'),
  targetValue: z.number().positive().optional().nullable(),
  currentValue: z.number().nonnegative().default(0),
  progress: z.number().int().min(0).max(100).default(0),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED']).default('ACTIVE'),
  deadline: z.union([z.string(), z.date()]).optional().nullable(),
});
export type GoalInput = z.infer<typeof goalSchema>;
