import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { taskSchema } from '@/modules/tasks/interfaces/schemas';
import { updateTaskCommand } from '@/modules/tasks/application/commands/update-task.command';
import { deleteTaskCommand } from '@/modules/tasks/application/commands/delete-task.command';
import { taskRepository } from '@/modules/tasks/infrastructure/task.repository';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, taskSchema.partial());
    const { id: taskId } = await updateTaskCommand(user.id, id, body);
    const tasks = await taskRepository.findByUserId(user.id);
    return ok(tasks.find((t) => t.id === taskId));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteTaskCommand(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
