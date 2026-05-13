export type {
  LifeBalanceInput,
  SerializedLifeBalance,
  MoodValue,
  MoodInput,
  SerializedMoodLog,
} from '@/types/life-balance';

export type LifeBalanceScores = {
  saude: number;
  carreira: number;
  financas: number;
  relacionamentos: number;
  lazer: number;
  pessoal: number;
  espiritualidade: number;
  contribuicao: number;
};
