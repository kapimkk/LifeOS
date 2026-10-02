export interface PaidMonth {
  year: number;
  month: number;
}

export interface SerializedFixedReceivable {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  note: string | null;
  paidMonths: PaidMonth[];
  createdAt: string;
  updatedAt: string;
}
