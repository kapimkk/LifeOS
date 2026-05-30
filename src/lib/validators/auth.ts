import { z } from 'zod';
import { sanitizeText } from '@/lib/sanitize';

export const registerSchema = z.object({
  name: z.string().min(2, 'Informe seu nome').max(80).transform(sanitizeText),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres')
    .max(72, 'Senha muito longa'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Login não importa zod-sanitize (evita carregar sanitizers pesados na rota de auth). */
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
