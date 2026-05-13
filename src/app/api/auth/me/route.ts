import { getCurrentUser } from '@/shared/auth/session';
import { handleApiError, ok } from '@/lib/api';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
