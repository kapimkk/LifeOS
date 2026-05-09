import { handleApiError, ok } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';

export async function GET() {
  try {
    const user = await requireUser();
    const data = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}
