import { handleApiError, ok } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';

export async function POST() {
  try {
    const user = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
