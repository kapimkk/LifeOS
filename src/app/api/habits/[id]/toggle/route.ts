import type { NextRequest } from 'next/server';
import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { toggleHabitCommand } from '@/modules/habits/application/commands/toggle-habit.command';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await toggleHabitCommand(user.id, id, user.timezone ?? 'UTC'));
  } catch (err) {
    return handleApiError(err);
  }
}
