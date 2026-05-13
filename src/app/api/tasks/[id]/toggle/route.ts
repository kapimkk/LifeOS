import type { NextRequest } from 'next/server';
import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { toggleTaskCommand } from '@/modules/tasks/application/commands/toggle-task.command';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await toggleTaskCommand(user.id, id));
  } catch (err) {
    return handleApiError(err);
  }
}
