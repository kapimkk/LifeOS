import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { habitSchema } from '@/lib/validators/habit';
import { requireUser } from '@/server/auth/session';
import { habitsService } from '@/server/services/habits';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, habitSchema.partial());
    return ok(await habitsService.update(user.id, id, body));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await habitsService.remove(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
