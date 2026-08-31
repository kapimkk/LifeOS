import 'server-only';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { SerializedRoutineItem } from '../domain/entities';
import type { RoutineItemInput, WeekDay } from '@/lib/validators/routine';

function serialize(row: {
  id: string;
  day: string;
  startMinute: number;
  endMinute: number;
  title: string;
  description: string | null;
  category: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}): SerializedRoutineItem {
  return {
    id: row.id,
    day: row.day as WeekDay,
    startMinute: row.startMinute,
    endMinute: row.endMinute,
    title: row.title,
    description: row.description,
    category: row.category,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const routineRepository = {
  async findByUserId(userId: string): Promise<SerializedRoutineItem[]> {
    const items = await prisma.routineItem.findMany({
      where: { userId },
      orderBy: [{ day: 'asc' }, { startMinute: 'asc' }],
    });
    return items.map(serialize);
  },

  async create(userId: string, data: RoutineItemInput): Promise<SerializedRoutineItem> {
    const created = await prisma.routineItem.create({
      data: {
        userId,
        day: data.day,
        startMinute: data.startMinute,
        endMinute: data.endMinute,
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        color: data.color,
      },
    });
    return serialize(created);
  },

  async update(userId: string, id: string, data: RoutineItemInput): Promise<SerializedRoutineItem> {
    await this.assertOwnership(userId, id);
    const updated = await prisma.routineItem.update({
      where: { id },
      data: {
        day: data.day,
        startMinute: data.startMinute,
        endMinute: data.endMinute,
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        color: data.color,
      },
    });
    return serialize(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.routineItem.delete({ where: { id } });
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
    const found = await prisma.routineItem.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Item da rotina não encontrado');
  },
};
