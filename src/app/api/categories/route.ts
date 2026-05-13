import type { NextRequest } from 'next/server';
import { created, handleApiError, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { categorySchema } from '@/modules/finance/interfaces/schemas';
import { listCategoriesQuery } from '@/modules/finance/application/queries/list-categories.query';
import { createCategoryCommand } from '@/modules/finance/application/commands/manage-category.command';
import { categoryRepository } from '@/modules/finance/infrastructure/category.repository';

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listCategoriesQuery(user.id));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await parseJson(req, categorySchema);
    const { id } = await createCategoryCommand(user.id, body);
    const cats = await categoryRepository.findByUserId(user.id);
    return created(cats.find((c) => c.id === id));
  } catch (err) {
    return handleApiError(err);
  }
}
