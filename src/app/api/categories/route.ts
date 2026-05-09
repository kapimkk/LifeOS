import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { categorySchema } from '@/lib/validators/transaction';
import { requireUser } from '@/server/auth/session';
import { categoriesService } from '@/server/services/categories';

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await categoriesService.list(user.id));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, categorySchema);
    return created(await categoriesService.create(user.id, body));
  } catch (err) {
    return handleApiError(err);
  }
}
