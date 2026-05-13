import type { NextRequest } from 'next/server';
import { handleApiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { updatePreferencesSchema } from '@/modules/users/interfaces/schemas';
import { updatePreferencesCommand } from '@/modules/users/application/commands/update-preferences.command';

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, updatePreferencesSchema);
    const updated = await updatePreferencesCommand(user.id, body);
    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
