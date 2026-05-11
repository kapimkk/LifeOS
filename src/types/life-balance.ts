// Tipos puros (sem Zod, sem 'use server') — seguros para qualquer contexto

// ─── Roda da Vida ─────────────────────────────────────────────────────────────

export interface LifeBalanceInput {
  saude: number;
  carreira: number;
  financas: number;
  relacionamentos: number;
  lazer: number;
  pessoal: number;
  espiritualidade: number;
  contribuicao: number;
  notes?: string | null;
}

export interface SerializedLifeBalance extends LifeBalanceInput {
  id: string;
  userId: string;
  updatedAt: string;
}

// ─── Diário de Humor ──────────────────────────────────────────────────────────

export type MoodValue = 'awful' | 'bad' | 'okay' | 'good' | 'great';

export interface MoodInput {
  mood: MoodValue;
  note?: string | null;
}

export interface SerializedMoodLog {
  id: string;
  mood: string;
  note: string | null;
  date: string;
}
