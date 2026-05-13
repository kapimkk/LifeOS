import { destroySession } from '@/shared/auth/session';
import { handleApiError, ok } from '@/lib/api';

export async function POST() {
  try {
    await destroySession();
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
