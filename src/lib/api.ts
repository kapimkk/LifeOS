import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { UnauthorizedError } from '@/server/auth/session';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Erro de validação', details: error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
  }
  console.error('[API ERROR]', error);
  return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) throw err;
    throw new ApiError(400, 'JSON inválido');
  }
}
