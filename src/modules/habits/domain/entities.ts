export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string;
  targetPerDay: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  streakAtRisk: boolean;
  consistency30d: number;
  last30: { date: string; done: boolean }[];
}

export interface HabitTodaySummary {
  active: number;
  done: number;
  percentage: number;
}
