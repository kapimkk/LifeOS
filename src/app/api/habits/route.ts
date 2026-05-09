import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { habitSchema } from '@/lib/validators/habit';
import { requireUser } from '@/server/auth/session';
import { habitsService } from '@/server/services/habits';

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await habitsService.listWithStats(user.id));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, habitSchema);
    return created(await habitsService.create(user.id, body));
  } catch (err) {
    return handleApiError(err);
  }
}
