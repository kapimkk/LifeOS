import { handleApiError, ok } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';

export async function POST() {
  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardedAt: new Date() },
    });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
