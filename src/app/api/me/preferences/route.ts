import type { NextRequest } from 'next/server';
import { handleApiError, ok, parseJson } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { updatePreferencesSchema } from '@/lib/validators/user';

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, updatePreferencesSchema);

    const updated = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...body },
      update: body,
    });

    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
