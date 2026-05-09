import 'server-only';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { HabitInput } from '@/lib/validators/habit';

function startOfDayUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function diffDays(a: Date, b: Date) {
  const ms = Math.abs(startOfDayUTC(a).getTime() - startOfDayUTC(b).getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export interface HabitWithStats {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string;
  active: boolean;
  targetPerDay: number;
  streak: number;
  longestStreak: number;
  doneToday: boolean;
  consistency30d: number;
  last30: { date: string; done: boolean }[];
}

export const habitsService = {
  async listWithStats(userId: string): Promise<HabitWithStats[]> {
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 60);

    const logs = await prisma.habitLog.findMany({
      where: { userId, date: { gte: startOfDayUTC(since) } },
      orderBy: { date: 'desc' },
    });

    const today = startOfDayUTC(new Date());

    return habits.map((h) => {
      const habitLogs = logs.filter((l) => l.habitId === h.id);
      const doneDates = new Set(habitLogs.map((l) => startOfDayUTC(l.date).toISOString()));

      const doneToday = doneDates.has(today.toISOString());

      // streak atual: dias consecutivos terminando hoje (ou ontem se não fez hoje)
      let streak = 0;
      const cursor = new Date(today);
      if (!doneToday) cursor.setUTCDate(cursor.getUTCDate() - 1);
      while (doneDates.has(cursor.toISOString())) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }

      // maior streak nos últimos 60 dias
      let longest = 0;
      let current = 0;
      const cur = new Date(today);
      cur.setUTCDate(cur.getUTCDate() - 59);
      for (let i = 0; i < 60; i++) {
        if (doneDates.has(cur.toISOString())) {
          current += 1;
          longest = Math.max(longest, current);
        } else {
          current = 0;
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      // últimos 30 dias para calendário visual
      const last30: { date: string; done: boolean }[] = [];
      const c2 = new Date(today);
      c2.setUTCDate(c2.getUTCDate() - 29);
      let done30 = 0;
      for (let i = 0; i < 30; i++) {
        const iso = c2.toISOString();
        const done = doneDates.has(iso);
        if (done) done30 += 1;
        last30.push({ date: iso.slice(0, 10), done });
        c2.setUTCDate(c2.getUTCDate() + 1);
      }
      const consistency30d = Math.round((done30 / 30) * 100);

      return {
        id: h.id,
        title: h.title,
        description: h.description,
        icon: h.icon,
        color: h.color,
        active: h.active,
        targetPerDay: h.targetPerDay,
        streak,
        longestStreak: longest,
        doneToday,
        consistency30d,
        last30,
      };
    });
  },

  create(userId: string, data: HabitInput) {
    return prisma.habit.create({ data: { ...data, userId } });
  },

  async update(userId: string, id: string, data: Partial<HabitInput>) {
    await this.assertOwnership(userId, id);
    return prisma.habit.update({ where: { id }, data });
  },

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    await prisma.habit.delete({ where: { id } });
  },

  async toggleToday(userId: string, habitId: string, date?: Date) {
    await this.assertOwnership(userId, habitId);
    const day = startOfDayUTC(date ?? new Date());
    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date: day } },
    });
    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } });
      return { done: false };
    }
    await prisma.habitLog.create({
      data: { habitId, userId, date: day },
    });
    return { done: true };
  },

  async assertOwnership(userId: string, id: string) {
    const found = await prisma.habit.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Hábito não encontrado');
  },

  async todaySummary(userId: string) {
    const today = startOfDayUTC(new Date());
    const [active, done] = await Promise.all([
      prisma.habit.count({ where: { userId, active: true } }),
      prisma.habitLog.count({ where: { userId, date: today } }),
    ]);
    return { active, done, percentage: active === 0 ? 0 : Math.round((done / active) * 100) };
  },
};

export { diffDays };
