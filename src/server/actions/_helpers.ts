import 'server-only';
import { ZodError } from 'zod';
import { ApiError } from '@/lib/api';
import { UnauthorizedError } from '@/server/auth/session';

/**
 * Resultado padronizado de Server Actions.
 *
 * Ao retornar `{ error }` em vez de `throw`, evitamos o overlay de erro do
 * Next em produção e damos controle total ao Client Component para mostrar
 * o feedback (toast, inline error, etc.).
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export function actionError(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    const flat = error.flatten();
    return {
      success: false,
      error: 'Dados inválidos',
      fieldErrors: flat.fieldErrors,
    };
  }

  if (error instanceof UnauthorizedError) {
    // Never leak session internals — return a generic 401 message
    return { success: false, error: 'Não autenticado. Faça login novamente.' };
  }

  if (error instanceof ApiError) {
    // 4xx errors (incl. 404 from assertOwnership) are safe to surface
    if (error.status >= 400 && error.status < 500) {
      return { success: false, error: error.message };
    }
    // 5xx: log server-side, return generic message to client
    console.error('[ACTION ERROR] ApiError 5xx:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }

  // Unknown errors: log full details server-side, never expose to client
  console.error('[ACTION ERROR]', error);
  return { success: false, error: 'Erro interno do servidor' };
}

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}
