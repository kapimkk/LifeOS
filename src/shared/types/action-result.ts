import 'server-only';
import { ZodError } from 'zod';
import { ApiError } from '@/lib/api';
import { UnauthorizedError } from '@/shared/errors';

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
    return { success: false, error: 'Não autenticado. Faça login novamente.' };
  }

  if (error instanceof ApiError) {
    if (error.status >= 400 && error.status < 500) {
      return { success: false, error: error.message };
    }
    console.error('[ACTION ERROR] ApiError 5xx:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }

  console.error('[ACTION ERROR]', error);
  return { success: false, error: 'Erro interno do servidor' };
}

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}
