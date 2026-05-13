import 'server-only';
import { prisma } from '@/lib/prisma';
import type { SerializedMoodLog, MoodInput } from '@/types/life-balance';

function todayUTC(timezone: string): Date {
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function serialize(r: {
  id: string;
  mood: string;
  note: string | null;
  date: Date;
}): SerializedMoodLog {
  return { id: r.id, mood: r.mood, note: r.note, date: r.date.toISOString() };
}

export const moodRepository = {
  async findToday(userId: string, timezone: string): Promise<SerializedMoodLog | null> {
    const today = todayUTC(timezone);
    const record = await prisma.moodLog.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    return record ? serialize(record) : null;
  },

  async upsertToday(userId: string, timezone: string, data: MoodInput): Promise<SerializedMoodLog> {
    const today = todayUTC(timezone);
    const record = await prisma.moodLog.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, mood: data.mood, note: data.note ?? null, date: today },
      update: { mood: data.mood, note: data.note ?? null },
    });
    return serialize(record);
  },

  async findHistory(userId: string, days: number): Promise<SerializedMoodLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const records = await prisma.moodLog.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });
    return records.map(serialize);
  },
};

export { todayUTC };
