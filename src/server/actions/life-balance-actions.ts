'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/server/auth/session';
import { actionError, actionSuccess, type ActionResult } from './_helpers';
import { lifeBalanceSchema, moodSchema } from '@/lib/validators/life-balance';
import type {
  LifeBalanceInput,
  SerializedLifeBalance,
  MoodInput,
  SerializedMoodLog,
} from '@/types/life-balance';

// ─── Helper ───────────────────────────────────────────────────────────────────

function todayUTC(timezone: string): Date {
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
  return new Date(`${dateStr}T00:00:00.000Z`);
}

// ─── Roda da Vida ─────────────────────────────────────────────────────────────

export async function getLifeBalance(): Promise<SerializedLifeBalance | null> {
  const user = await requireUser();
  const record = await prisma.lifeBalance.findUnique({ where: { userId: user.id } });
  if (!record) return null;
  return {
    ...record,
    notes: record.notes,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function saveLifeBalanceAction(
  input: LifeBalanceInput,
): Promise<ActionResult<SerializedLifeBalance>> {
  try {
    const user = await requireUser();
    const data = lifeBalanceSchema.parse(input);

    const record = await prisma.lifeBalance.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    revalidatePath('/roda-da-vida');
    revalidatePath('/dashboard');

    return actionSuccess({
      ...record,
      notes: record.notes,
      updatedAt: record.updatedAt.toISOString(),
    });
  } catch (err) {
    return actionError(err);
  }
}

// ─── Diário de Humor ──────────────────────────────────────────────────────────

export async function getTodayMood(): Promise<SerializedMoodLog | null> {
  const user = await requireUser();
  const today = todayUTC(user.timezone ?? 'America/Sao_Paulo');
  const record = await prisma.moodLog.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });
  if (!record) return null;
  return {
    id: record.id,
    mood: record.mood,
    note: record.note,
    date: record.date.toISOString(),
  };
}

export async function saveMoodAction(input: MoodInput): Promise<ActionResult<SerializedMoodLog>> {
  try {
    const user = await requireUser();
    const data = moodSchema.parse(input);
    const today = todayUTC(user.timezone ?? 'America/Sao_Paulo');

    const record = await prisma.moodLog.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      create: { userId: user.id, mood: data.mood, note: data.note ?? null, date: today },
      update: { mood: data.mood, note: data.note ?? null },
    });

    revalidatePath('/dashboard');

    return actionSuccess({
      id: record.id,
      mood: record.mood,
      note: record.note,
      date: record.date.toISOString(),
    });
  } catch (err) {
    return actionError(err);
  }
}

export async function getMoodHistory(days = 365): Promise<SerializedMoodLog[]> {
  const user = await requireUser();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.moodLog.findMany({
    where: { userId: user.id, date: { gte: since } },
    orderBy: { date: 'asc' },
  });

  return records.map((r) => ({
    id: r.id,
    mood: r.mood,
    note: r.note,
    date: r.date.toISOString(),
  }));
}
