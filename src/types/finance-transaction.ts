/** Tipos puros para transações no client (uso em formulários / listagens). */

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT' | 'PIX';

export interface SerializedTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  notes?: string | null;
  categoryId?: string | null;
  date: string;
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  paymentMethod: PaymentMethod;
  installments: number;
  isCreditCard: boolean;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  category?: { id: string; name: string; color: string } | null;
}
