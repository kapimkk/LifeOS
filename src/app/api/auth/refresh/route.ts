import { refreshSession } from '@/server/auth/session';
import { ApiError, handleApiError, ok } from '@/lib/api';

export async function POST() {
  try {
    const result = await refreshSession();
    if (!result) throw new ApiError(401, 'Sessão expirada');
    return ok({ refreshed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
