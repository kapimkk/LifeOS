import type { WeekDay } from '@/lib/validators/routine';

export interface RoutineItem {
  id: string;
  userId: string;
  day: WeekDay;
  startMinute: number;
  endMinute: number;
  title: string;
  description: string | null;
  category: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedRoutineItem {
  id: string;
  day: WeekDay;
  startMinute: number;
  endMinute: number;
  title: string;
  description: string | null;
  category: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}
