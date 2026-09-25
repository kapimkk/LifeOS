export interface Receivable {
  id: string;
  userId: string;
  debtorName: string;
  amount: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedReceivable {
  id: string;
  debtorName: string;
  amount: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
