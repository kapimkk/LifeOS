import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { categorySchema } from '@/lib/validators/transaction';
import { requireUser } from '@/server/auth/session';
import { categoriesService } from '@/server/services/categories';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, categorySchema.partial());
    return ok(await categoriesService.update(user.id, id, body));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await categoriesService.remove(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
