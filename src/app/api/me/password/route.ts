import type { NextRequest } from 'next/server';
import { handleApiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { changePasswordSchema } from '@/modules/users/interfaces/schemas';
import { changePasswordCommand } from '@/modules/users/application/commands/change-password.command';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, changePasswordSchema);
    await changePasswordCommand(user.id, body);
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
