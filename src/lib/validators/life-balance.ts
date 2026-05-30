import { z } from 'zod';
import { safeOptionalText } from '@/lib/zod-sanitize';

// Re-exporta tipos do local canônico para quem importa daqui
export type {
  LifeBalanceInput,
  SerializedLifeBalance,
  MoodValue,
  MoodInput,
  SerializedMoodLog,
} from '@/types/life-balance';

// ─── Roda da Vida ─────────────────────────────────────────────────────────────

const scoreField = z.number().int().min(0).max(10);

export const lifeBalanceSchema = z.object({
  saude: scoreField,
  carreira: scoreField,
  financas: scoreField,
  relacionamentos: scoreField,
  lazer: scoreField,
  pessoal: scoreField,
  espiritualidade: scoreField,
  contribuicao: scoreField,
  notes: safeOptionalText(1000),
});

// ─── Diário de Humor ──────────────────────────────────────────────────────────

export const moodSchema = z.object({
  mood: z.enum(['awful', 'bad', 'okay', 'good', 'great']),
  note: safeOptionalText(500),
});
