'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface Slice {
  name: string;
  value: number;
  color: string;
}

export function CategoryChart({ data }: { data: Slice[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Despesas por categoria</CardTitle>
        <CardDescription>Mês atual</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Sem despesas registradas neste mês
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem',
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{formatCurrency(total)}</p>
              </div>
            </div>

            <ul className="flex flex-col justify-center gap-2 text-sm">
              {data.slice(0, 6).map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="truncate text-foreground">{d.name}</span>
                  </div>
                  <span className="shrink-0 text-muted-foreground">{formatCurrency(d.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
