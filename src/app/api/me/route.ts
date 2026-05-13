import type { NextRequest } from 'next/server';
import { handleApiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { updateProfileSchema } from '@/modules/users/interfaces/schemas';
import { updateProfileCommand } from '@/modules/users/application/commands/update-profile.command';

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
    const updated = await updateProfileCommand(user.id, body);
    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
