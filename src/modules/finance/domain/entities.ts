export interface Investment {
  id: string;
  userId: string;
  name: string;
  amount: unknown;
  type: string;
  color: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedInvestment {
  id: string;
  name: string;
  amount: number;
  type: string;
  color: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
