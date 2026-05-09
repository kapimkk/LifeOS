import 'server-only';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { TaskInput } from '@/lib/validators/task';

export const tasksService = {
  list(userId: string, status?: string) {
    return prisma.task.findMany({
      where: { userId, ...(status && { status: status as 'TODO' | 'DONE' }) },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
    });
  },

  create(userId: string, data: TaskInput) {
    return prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description ?? null,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        completedAt: data.status === 'DONE' ? new Date() : null,
      },
    });
  },

  async update(userId: string, id: string, data: Partial<TaskInput>) {
    await this.assertOwnership(userId, id);
    return prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.status !== undefined && {
          status: data.status,
          completedAt: data.status === 'DONE' ? new Date() : null,
        }),
      },
    });
  },

  async toggle(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new ApiError(404, 'Tarefa não encontrada');
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    return prisma.task.update({
      where: { id },
      data: { status: newStatus, completedAt: newStatus === 'DONE' ? new Date() : null },
    });
  },

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    await prisma.task.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string) {
    const found = await prisma.task.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Tarefa não encontrada');
  },

  async stats(userId: string) {
    const [todo, inProgress, done] = await Promise.all([
      prisma.task.count({ where: { userId, status: 'TODO' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'DONE' } }),
    ]);
    return { todo, inProgress, done, total: todo + inProgress + done };
  },
};
