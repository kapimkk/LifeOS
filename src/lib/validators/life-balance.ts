import { z } from 'zod';

// ─── Roda da Vida ─────────────────────────────────────────────────────────────

const scoreField = z.number().int().min(0).max(10);

export const lifeBalanceSchema = z.object({
  saude:           scoreField,
  carreira:        scoreField,
  financas:        scoreField,
  relacionamentos: scoreField,
  lazer:           scoreField,
  pessoal:         scoreField,
  espiritualidade: scoreField,
  contribuicao:    scoreField,
  notes:           z.string().max(1000).optional().nullable(),
});

export type LifeBalanceInput = z.infer<typeof lifeBalanceSchema>;

export interface SerializedLifeBalance extends LifeBalanceInput {
  id: string;
  userId: string;
  updatedAt: string;
}

// ─── Diário de Humor ──────────────────────────────────────────────────────────

export const moodSchema = z.object({
  mood: z.enum(['awful', 'bad', 'okay', 'good', 'great']),
  note: z.string().max(500).optional().nullable(),
});

export type MoodInput = z.infer<typeof moodSchema>;

export interface SerializedMoodLog {
  id: string;
  mood: string;
  note: string | null;
  date: string;
}
