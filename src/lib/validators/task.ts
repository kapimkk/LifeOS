import { z } from 'zod';
import { safeText, safeOptionalText } from '@/lib/zod-sanitize';

export const taskSchema = z.object({
  title: safeText(1, 200),
  description: safeOptionalText(2000),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.union([z.string(), z.date()]).optional().nullable(),
});
export type TaskInput = z.infer<typeof taskSchema>;
