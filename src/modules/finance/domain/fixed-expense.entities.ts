import type { FixedExpenseGroup } from '@/lib/validators/fixed-expense';

export interface FixedExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: number;
  paid: boolean;
  group: FixedExpenseGroup;
  createdAt: Date;
}

export interface SerializedFixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  paid: boolean;
  group: FixedExpenseGroup;
  createdAt: string;
}
