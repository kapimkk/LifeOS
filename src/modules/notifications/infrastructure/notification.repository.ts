import 'server-only';
import { prisma } from '@/lib/prisma';
import type { Notification } from '../domain/entities';

export const notificationRepository = {
  async findByUserId(userId: string, limit = 30): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }) as Promise<Notification[]>;
  },

  async markAllRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
};
