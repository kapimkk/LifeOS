import type { NextRequest } from 'next/server';
import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/server/auth/session';
import { habitsService } from '@/server/services/habits';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await habitsService.toggleToday(user.id, id));
  } catch (err) {
    return handleApiError(err);
  }
}
