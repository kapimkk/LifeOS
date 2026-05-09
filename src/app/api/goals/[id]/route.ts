import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { goalSchema } from '@/lib/validators/goal';
import { requireUser } from '@/server/auth/session';
import { goalsService } from '@/server/services/goals';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, goalSchema.partial());
    return ok(await goalsService.update(user.id, id, body));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await goalsService.remove(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
