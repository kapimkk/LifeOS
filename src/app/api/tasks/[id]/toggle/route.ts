import type { NextRequest } from 'next/server';
import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/server/auth/session';
import { tasksService } from '@/server/services/tasks';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await tasksService.toggle(user.id, id));
  } catch (err) {
    return handleApiError(err);
  }
}
