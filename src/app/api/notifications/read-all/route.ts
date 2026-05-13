import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { markAllReadCommand } from '@/modules/notifications/application/commands/mark-all-read.command';

export async function POST() {
  try {
    const user = await requireUser();
    await markAllReadCommand(user.id);
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
