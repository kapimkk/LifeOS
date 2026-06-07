export interface FixedExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: number;
  createdAt: Date;
}

export interface SerializedFixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  createdAt: string;
}
