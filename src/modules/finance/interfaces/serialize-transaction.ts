import type { SerializedTransaction } from '@/types/finance-transaction';

type Row = {
  id: string;
  type: string;
  amount: unknown;
  description: string;
  notes: string | null;
  categoryId: string | null;
  date: Date;
  recurrence: string;
  paymentMethod: string;
  installments: number;
  isCreditCard: boolean;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  category?: { id: string; name: string; color: string } | null;
};

export function serializeTransaction(row: Row): SerializedTransaction {
  return {
    id: row.id,
    type: row.type as SerializedTransaction['type'],
    amount: Number(row.amount),
    description: row.description,
    notes: row.notes,
    categoryId: row.categoryId,
    date: row.date.toISOString(),
    recurrence: row.recurrence as SerializedTransaction['recurrence'],
    paymentMethod: row.paymentMethod as SerializedTransaction['paymentMethod'],
    installments: row.installments,
    isCreditCard: row.isCreditCard,
    installmentGroupId: row.installmentGroupId,
    installmentNumber: row.installmentNumber,
    category: row.category
      ? { id: row.category.id, name: row.category.name, color: row.category.color }
      : null,
  };
}
