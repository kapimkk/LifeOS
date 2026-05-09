/**
 * Fetcher do client-side. Sempre envia cookies (httpOnly) e trata
 * erros padronizados do backend.
 */
export async function apiFetch<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = payload?.error ?? `Erro ${res.status}`;
    const error = new Error(message) as Error & { details?: unknown; status?: number };
    error.details = payload?.details;
    error.status = res.status;
    throw error;
  }

  return (payload?.data ?? payload) as T;
}
