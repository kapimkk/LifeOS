import { z } from 'zod';

export const habitSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  icon: z.string().max(40).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#22c55e'),
  targetPerDay: z.number().int().positive().max(20).default(1),
  active: z.boolean().default(true),
});
export type HabitInput = z.infer<typeof habitSchema>;

export const habitLogSchema = z.object({
  habitId: z.string().min(1),
  date: z.union([z.string(), z.date()]).optional(),
});
