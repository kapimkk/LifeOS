import { PageHeader } from '@/components/layout/page-header';
import { FixedExpenseSubnav } from '@/app/(app)/financas/fixed-expense-subnav';

export default function FixedExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanças"
        description="Separe os gastos fixos em planos, investimentos e contas gerais."
      />
      <FixedExpenseSubnav />
      {children}
    </div>
  );
}
