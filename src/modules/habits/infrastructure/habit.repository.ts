import 'server-only';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { Habit, HabitWithStats, HabitTodaySummary } from '../domain/entities';
import type { HabitInput } from '@/lib/validators/habit';

// ─── Date helpers (timezone-aware) ────────────────────────────────────────────

function localDateString(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
}

function startOfLocalDay(timezone: string): Date {
  return new Date(`${localDateString(timezone)}T00:00:00.000Z`);
}

function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function diffDays(a: Date, b: Date): number {
  const ms = Math.abs(startOfDayUTC(a).getTime() - startOfDayUTC(b).getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const habitRepository = {
  async findByUserId(userId: string): Promise<Habit[]> {
    return prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    }) as Promise<Habit[]>;
  },

  async findWithStats(userId: string, timezone = 'UTC'): Promise<HabitWithStats[]> {
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    const today = startOfLocalDay(timezone);
    const since = new Date(today);
    since.setUTCDate(since.getUTCDate() - 60);

    const logs = await prisma.habitLog.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'desc' },
    });

    return habits.map((h) => {
      const habitLogs = logs.filter((l) => l.habitId === h.id);
      const doneDates = new Set(habitLogs.map((l) => startOfDayUTC(l.date).toISOString()));
      const doneToday = doneDates.has(today.toISOString());

      let streak = 0;
      const cursor = new Date(today);
      if (!doneToday) cursor.setUTCDate(cursor.getUTCDate() - 1);
      while (doneDates.has(cursor.toISOString())) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }

      const streakAtRisk = streak > 0 && !doneToday;

      let longest = 0,
        current = 0;
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
        streakAtRisk,
        consistency30d: Math.round((done30 / 30) * 100),
        last30,
      };
    });
  },

  async create(userId: string, data: HabitInput): Promise<Habit> {
    return prisma.habit.create({ data: { ...data, userId } }) as Promise<Habit>;
  },

  async update(userId: string, id: string, data: Partial<HabitInput>): Promise<Habit> {
    await this.assertOwnership(userId, id);
    return prisma.habit.update({ where: { id }, data }) as Promise<Habit>;
  },

  async remove(userId: string, id: string): Promise<void> {
    await this.assertOwnership(userId, id);
    await prisma.habit.delete({ where: { id } });
  },

  async toggleToday(userId: string, habitId: string, timezone = 'UTC'): Promise<{ done: boolean }> {
    await this.assertOwnership(userId, habitId);
    const day = startOfLocalDay(timezone);
    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date: day } },
    });
    if (existing) {
      await prisma.habitLog.deleteMany({ where: { id: existing.id } });
      return { done: false };
    }
    await prisma.habitLog.create({ data: { habitId, userId, date: day } });
    return { done: true };
  },

  async todaySummary(userId: string, timezone = 'UTC'): Promise<HabitTodaySummary> {
    const today = startOfLocalDay(timezone);
    const [active, done] = await Promise.all([
      prisma.habit.count({ where: { userId, active: true } }),
      prisma.habitLog.count({ where: { userId, date: today } }),
    ]);
    return { active, done, percentage: active === 0 ? 0 : Math.round((done / active) * 100) };
  },

  async assertOwnership(userId: string, id: string): Promise<void> {
    const found = await prisma.habit.findFirst({ where: { id, userId }, select: { id: true } });
    if (!found) throw new ApiError(404, 'Hábito não encontrado');
  },
};
