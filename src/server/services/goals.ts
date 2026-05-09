import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { GoalInput } from '@/lib/validators/goal';
import { calcPercentage } from '@/lib/utils';

function deriveProgress(input: Partial<GoalInput>): number | undefined {
  if (input.progress !== undefined) return input.progress;
  if (input.targetValue && input.currentValue !== undefined) {
    return calcPercentage(input.currentValue, input.targetValue);
  }
  return undefined;
}

export const goalsService = {
  list(userId: string, status?: string) {
    return prisma.goal.findMany({
      where: { userId, ...(status && { status: status as 'ACTIVE' | 'COMPLETED' }) },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { deadline: 'asc' }],
    });
  },

  create(userId: string, data: GoalInput) {
    const progress = deriveProgress(data) ?? 0;
    return prisma.goal.create({
      data: {
        userId,
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        targetValue: data.targetValue ? new Prisma.Decimal(data.targetValue) : null,
        currentValue: new Prisma.Decimal(data.currentValue),
        progress,
        priority: data.priority,
        status: progress >= 100 ? 'COMPLETED' : data.status,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });
  },

  async update(userId: string, id: string, data: Partial<GoalInput>) {
    await this.assertOwnership(userId, id);
    const progress = deriveProgress(data);
    return prisma.goal.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.targetValue !== undefined && {
          targetValue: data.targetValue ? new Prisma.Decimal(data.targetValue) : null,
        }),
        ...(data.currentValue !== undefined && {
          currentValue: new Prisma.Decimal(data.currentValue),
        }),
        ...(progress !== undefined && {
          progress,
          ...(progress >= 100 && { status: 'COMPLETED' as const }),
        }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.status !== undefined && progress !== 100 && { status: data.status }),
        ...(data.deadline !== undefined && {
          deadline: data.deadline ? new Date(data.deadline) : null,
        }),
      },
    });
  },

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    await prisma.goal.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string) {
    const found = await prisma.goal.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Meta não encontrada');
  },

  async stats(userId: string) {
    const [total, active, completed] = await Promise.all([
      prisma.goal.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.goal.count({ where: { userId, status: 'COMPLETED' } }),
    ]);
    const avgProgress = await prisma.goal.aggregate({
      where: { userId, status: 'ACTIVE' },
      _avg: { progress: true },
    });
    return {
      total,
      active,
      completed,
      avgProgress: Math.round(avgProgress._avg.progress ?? 0),
    };
  },
};
