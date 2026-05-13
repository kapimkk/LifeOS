export type GoalCategory = 'FINANCIAL' | 'PERSONAL' | 'STUDIES' | 'FITNESS' | 'CAREER' | 'OTHER';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  targetValue: unknown; // Prisma Decimal
  currentValue: unknown;
  progress: number;
  priority: GoalPriority;
  status: GoalStatus;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalStats {
  total: number;
  active: number;
  completed: number;
  avgProgress: number;
}
