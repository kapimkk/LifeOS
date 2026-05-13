import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { habitSchema } from '@/modules/habits/interfaces/schemas';
import { updateHabitCommand } from '@/modules/habits/application/commands/update-habit.command';
import { deleteHabitCommand } from '@/modules/habits/application/commands/delete-habit.command';
import { habitRepository } from '@/modules/habits/infrastructure/habit.repository';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, habitSchema.partial());
    const { id: habitId } = await updateHabitCommand(user.id, id, body);
    const habits = await habitRepository.findByUserId(user.id);
    return ok(habits.find((h) => h.id === habitId));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteHabitCommand(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
