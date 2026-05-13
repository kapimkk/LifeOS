import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { habitSchema } from '@/modules/habits/interfaces/schemas';
import { listHabitsWithStatsQuery } from '@/modules/habits/application/queries/list-habits.query';
import { createHabitCommand } from '@/modules/habits/application/commands/create-habit.command';
import { habitRepository } from '@/modules/habits/infrastructure/habit.repository';

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listHabitsWithStatsQuery(user.id, user.timezone ?? 'UTC'));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, habitSchema);
    const { id } = await createHabitCommand(user.id, body);
    const habits = await habitRepository.findByUserId(user.id);
    const created_habit = habits.find((h) => h.id === id);
    return created(created_habit);
  } catch (err) {
    return handleApiError(err);
  }
}
