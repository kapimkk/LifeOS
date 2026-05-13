import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { goalSchema } from '@/modules/goals/interfaces/schemas';
import { listGoalsQuery } from '@/modules/goals/application/queries/list-goals.query';
import { createGoalCommand } from '@/modules/goals/application/commands/create-goal.command';
import { goalRepository } from '@/modules/goals/infrastructure/goal.repository';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const status = req.nextUrl.searchParams.get('status') ?? undefined;
    return ok(await listGoalsQuery(user.id, status));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, goalSchema);
    const { id } = await createGoalCommand(user.id, body);
    const goals = await goalRepository.findByUserId(user.id);
    return created(goals.find((g) => g.id === id));
  } catch (err) {
    return handleApiError(err);
  }
}
