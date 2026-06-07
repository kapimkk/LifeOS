import Link from 'next/link';
import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { SerializedInvestment } from '@/modules/finance/domain/entities';

interface Props {
  investments: SerializedInvestment[];
  total: number;
  currency: string;
  byType: Record<string, number>;
}

export function DashboardInvestmentsSummary({ investments, total, currency, byType }: Props) {
  const topTypes = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChart className="h-4 w-4 text-emerald-500" />
          Investimentos
        </CardTitle>
        <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
          <Link href="/financas/investimentos">Gerenciar</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {investments.length === 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Nenhum investimento cadastrado. Registre suas caixinhas e alocações.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/financas/investimentos">Adicionar investimento</Link>
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs text-muted-foreground">Patrimônio registrado</p>
              <p className="text-2xl font-semibold tracking-tight">
                {formatCurrency(total, currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {investments.length} item{investments.length !== 1 ? 's' : ''}
              </p>
            </div>

            {topTypes.length > 0 && (
              <ul className="space-y-2">
                {topTypes.map(([type, amount]) => {
                  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                  return (
                    <li key={type} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{type}</span>
                      <span>
                        {formatCurrency(amount, currency)}
                        <span className="ml-2 text-xs text-muted-foreground">({pct}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <ul className="space-y-1 border-t pt-3">
              {investments.slice(0, 4).map((inv) => (
                <li key={inv.id} className="flex justify-between text-sm">
                  <span className="truncate pr-2">{inv.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatCurrency(inv.amount, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
