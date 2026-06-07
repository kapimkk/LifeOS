import { FinanceHubTabs } from '../finance-hub-tabs';

export default function FinanceHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <FinanceHubTabs />
      {children}
    </div>
  );
}
