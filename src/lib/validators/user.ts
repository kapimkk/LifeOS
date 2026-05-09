import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  currency: z.string().length(3).optional(),
  locale: z.string().min(2).max(10).optional(),
  timezone: z.string().min(2).max(60).optional(),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).optional(),
  weeklyDigest: z.boolean().optional(),
  emailReminders: z.boolean().optional(),
  pushReminders: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});
