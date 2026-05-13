import 'server-only';
import { prisma } from '@/lib/prisma';
import type { SerializedLifeBalance, LifeBalanceInput } from '@/types/life-balance';

export const lifeBalanceRepository = {
  async findByUserId(userId: string): Promise<SerializedLifeBalance | null> {
    const record = await prisma.lifeBalance.findUnique({ where: { userId } });
    if (!record) return null;
    return { ...record, notes: record.notes, updatedAt: record.updatedAt.toISOString() };
  },

  async upsert(userId: string, data: LifeBalanceInput): Promise<SerializedLifeBalance> {
    const record = await prisma.lifeBalance.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return { ...record, notes: record.notes, updatedAt: record.updatedAt.toISOString() };
  },
};
