import { PageHeader } from '@/components/layout/page-header';
import { ReceivableSubnav } from '@/app/(app)/financas/receivable-subnav';

export default function ReceivablesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanças"
        description="Registre quem te deve e os valores fixos que entram todo mês."
      />
      <ReceivableSubnav />
      {children}
    </div>
  );
}
