import type { NextRequest } from 'next/server';
import { handleApiError, noContent, ok, parseJson } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { categorySchema } from '@/modules/finance/interfaces/schemas';
import {
  updateCategoryCommand,
  deleteCategoryCommand,
} from '@/modules/finance/application/commands/manage-category.command';
import { categoryRepository } from '@/modules/finance/infrastructure/category.repository';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await parseJson(req, categorySchema.partial());
    const { id: catId } = await updateCategoryCommand(user.id, id, body);
    const cats = await categoryRepository.findByUserId(user.id);
    return ok(cats.find((c) => c.id === catId));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteCategoryCommand(user.id, id);
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
