export type TransactionType = 'INCOME' | 'EXPENSE';
export type Recurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT' | 'PIX';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: unknown;
  description: string;
  notes: string | null;
  date: Date;
  recurrence: Recurrence;
  paymentMethod: PaymentMethod;
  installments: number;
  isCreditCard: boolean;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string | null;
  type: TransactionType;
}

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

export interface MonthlySummary {
  income: number;
  /** Despesas que saem do saldo em conta no mês (exclui fatura cartão). */
  expenseCash: number;
  /** Parcelas/lançamentos de cartão com vencimento neste mês. */
  invoiceCreditCard: number;
  /** Soma de todas as despesas do mês. */
  expenseTotal: number;
  /** Saldo em conta no mês: receitas − despesas fora da fatura. */
  balanceCash: number;
  /** Receitas − todas as despesas (inclui cartão quando vencido no mês). */
  balanceIncludingCard: number;
}

export interface TransactionFilters {
  from?: Date;
  to?: Date;
  /** YYYY-MM-DD — filtra o dia inteiro (hora local). */
  day?: string;
  /** 0–11, usado com `year`. */
  month?: number;
  year?: number;
  type?: TransactionType;
  categoryId?: string;
  search?: string;
}
