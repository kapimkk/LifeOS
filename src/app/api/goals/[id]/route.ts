import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { goalSchema } from '@/modules/goals/interfaces/schemas';
import { updateGoalCommand } from '@/modules/goals/application/commands/update-goal.command';
import { deleteGoalCommand } from '@/modules/goals/application/commands/delete-goal.command';
import { goalRepository } from '@/modules/goals/infrastructure/goal.repository';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, goalSchema.partial());
    const { id: goalId } = await updateGoalCommand(user.id, id, body);
    const goals = await goalRepository.findByUserId(user.id);
    return ok(goals.find((g) => g.id === goalId));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteGoalCommand(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
