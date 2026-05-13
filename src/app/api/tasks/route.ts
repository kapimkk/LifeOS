import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { taskSchema } from '@/modules/tasks/interfaces/schemas';
import { listTasksQuery } from '@/modules/tasks/application/queries/list-tasks.query';
import { createTaskCommand } from '@/modules/tasks/application/commands/create-task.command';
import { taskRepository } from '@/modules/tasks/infrastructure/task.repository';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const status = req.nextUrl.searchParams.get('status') ?? undefined;
    return ok(await listTasksQuery(user.id, status));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, taskSchema);
    const { id } = await createTaskCommand(user.id, body);
    const tasks = await taskRepository.findByUserId(user.id);
    return created(tasks.find((t) => t.id === id));
  } catch (err) {
    return handleApiError(err);
  }
}
