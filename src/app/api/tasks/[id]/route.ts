import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { taskSchema } from '@/lib/validators/task';
import { requireUser } from '@/server/auth/session';
import { tasksService } from '@/server/services/tasks';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, taskSchema.partial());
    return ok(await tasksService.update(user.id, id, body));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await tasksService.remove(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
