import type { NextRequest } from 'next/server';
import { handleApiError, ok, parseJson } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { updateProfileSchema } from '@/lib/validators/user';

export async function GET() {
  try {
    const user = await requireUser();
    return ok(user);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, updateProfileSchema);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        currency: true,
        locale: true,
        timezone: true,
      },
    });
    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
