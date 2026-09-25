export interface FixedExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: number;
  paid: boolean;
  createdAt: Date;
}

export interface SerializedFixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  paid: boolean;
  createdAt: string;
}
