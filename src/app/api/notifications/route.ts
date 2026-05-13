import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { listNotificationsQuery } from '@/modules/notifications/application/queries/list-notifications.query';

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listNotificationsQuery(user.id));
  } catch (err) {
    return handleApiError(err);
  }
}
