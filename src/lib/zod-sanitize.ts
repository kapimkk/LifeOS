import { z } from 'zod';
import { sanitizeText } from '@/lib/sanitize';

/** String de texto livre: valida tamanho e sanitiza HTML/scripts. */
export function safeText(min: number, max: number, message?: string) {
  return z
    .string()
    .min(min, message ?? `Mínimo ${min} caracteres`)
    .max(max)
    .transform(sanitizeText);
}

/** Texto opcional/nullable sanitizado (string vazia → null). */
export function safeOptionalText(max: number) {
  return z
    .string()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => {
      if (v == null || v === '') return null;
      return sanitizeText(v);
    });
}
