import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { goalSchema } from '@/lib/validators/goal';
import { requireUser } from '@/server/auth/session';
import { goalsService } from '@/server/services/goals';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const status = req.nextUrl.searchParams.get('status') ?? undefined;
    return ok(await goalsService.list(user.id, status));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, goalSchema);
    return created(await goalsService.create(user.id, body));
  } catch (err) {
    return handleApiError(err);
  }
}
