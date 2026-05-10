import 'server-only';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import type { HabitInput } from '@/lib/validators/habit';

// ---------------------------------------------------------------------------
// Date helpers (timezone-aware)
// ---------------------------------------------------------------------------

/**
 * Returns the calendar date string (YYYY-MM-DD) in the given IANA timezone.
 * Uses Intl.DateTimeFormat which is available in all Node.js versions used by Next.js.
 */
function localDateString(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
}

/**
 * Returns the start of the current calendar day in the given timezone,
 * represented as UTC midnight of that local date.
 *
 * Example: if it's 23:30 in "America/Sao_Paulo" (UTC-3), this returns
 * the Date for "today 00:00 UTC" where "today" is the Sao Paulo date,
 * NOT the UTC date (which would be tomorrow).
 */
function startOfLocalDay(timezone: string): Date {
  const str = localDateString(timezone);
  return new Date(`${str}T00:00:00.000Z`);
}

/**
 * Returns UTC midnight for an arbitrary date (used for day math).
 */
function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function diffDays(a: Date, b: Date): number {
  const ms = Math.abs(startOfDayUTC(a).getTime() - startOfDayUTC(b).getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  /** true when streak > 0 but today not done yet — "at risk" Duolingo state */
  streakAtRisk: boolean;
  consistency30d: number;
  last30: { date: string; done: boolean }[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const habitsService = {
  /**
   * @param timezone IANA timezone string (e.g. "America/Sao_Paulo").
   *                 Defaults to UTC if omitted.
   */
  async listWithStats(userId: string, timezone = 'UTC'): Promise<HabitWithStats[]> {
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    const today = startOfLocalDay(timezone);

    // Fetch logs from 60 days ago so we can compute both streak and longest streak.
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

      // -----------------------------------------------------------------------
      // Streak (Duolingo style):
      //   • The streak counts consecutive calendar days ending today.
      //   • If today is already done → count from today backwards.
      //   • If today is NOT done yet → count from yesterday backwards
      //     (you still have time to "save" the streak today).
      //   • If yesterday is also not done → streak is 0 (broken).
      //   • "streakAtRisk" = streak > 0 but today not done yet.
      // -----------------------------------------------------------------------
      let streak = 0;
      const cursor = new Date(today);
      if (!doneToday) cursor.setUTCDate(cursor.getUTCDate() - 1); // grace: start from yesterday
      while (doneDates.has(cursor.toISOString())) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }

      const streakAtRisk = streak > 0 && !doneToday;

      // longest streak in the last 60 days
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

      // last 30 days for visual calendar
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
        streakAtRisk,
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

  /**
   * Toggles the habit log for today (in the user's timezone).
   * Uses deleteMany instead of delete to avoid Prisma P2025 ("record not found")
   * race-condition errors when the log is deleted between the findUnique and delete calls.
   */
  async toggleToday(userId: string, habitId: string, timezone = 'UTC') {
    await this.assertOwnership(userId, habitId);
    const day = startOfLocalDay(timezone);

    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date: day } },
    });

    if (existing) {
      // deleteMany never throws if the record disappeared between the check and this call
      await prisma.habitLog.deleteMany({ where: { id: existing.id } });
      return { done: false };
    }

    await prisma.habitLog.create({ data: { habitId, userId, date: day } });
    return { done: true };
  },

  async assertOwnership(userId: string, id: string) {
    const found = await prisma.habit.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new ApiError(404, 'Hábito não encontrado');
  },

  async todaySummary(userId: string, timezone = 'UTC') {
    const today = startOfLocalDay(timezone);
    const [active, done] = await Promise.all([
      prisma.habit.count({ where: { userId, active: true } }),
      prisma.habitLog.count({ where: { userId, date: today } }),
    ]);
    return { active, done, percentage: active === 0 ? 0 : Math.round((done / active) * 100) };
  },
};

export { diffDays };
