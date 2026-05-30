import { z } from 'zod';
import { safeText } from '@/lib/zod-sanitize';

export const registerSchema = z.object({
  name: safeText(2, 80, 'Informe seu nome'),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres')
    .max(72, 'Senha muito longa'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(1, 'Senha obrigatória'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres').max(72),
});
