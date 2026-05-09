import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { taskSchema } from '@/lib/validators/task';
import { requireUser } from '@/server/auth/session';
import { tasksService } from '@/server/services/tasks';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const status = req.nextUrl.searchParams.get('status') ?? undefined;
    return ok(await tasksService.list(user.id, status));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, taskSchema);
    return created(await tasksService.create(user.id, body));
  } catch (err) {
    return handleApiError(err);
  }
}
