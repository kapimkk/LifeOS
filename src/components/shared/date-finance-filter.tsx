'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type FinanceViewMode = 'day' | 'month' | 'year';

const MONTHS = [
  { v: '0', l: 'Janeiro' },
  { v: '1', l: 'Fevereiro' },
  { v: '2', l: 'Março' },
  { v: '3', l: 'Abril' },
  { v: '4', l: 'Maio' },
  { v: '5', l: 'Junho' },
  { v: '6', l: 'Julho' },
  { v: '7', l: 'Agosto' },
  { v: '8', l: 'Setembro' },
  { v: '9', l: 'Outubro' },
  { v: '10', l: 'Novembro' },
  { v: '11', l: 'Dezembro' },
];

interface DateFinanceFilterProps {
  /** yyyy-MM-dd */
  initialDay: string;
  initialMonth: number;
  initialYear: number;
}

export function DateFinanceFilter({
  initialDay,
  initialMonth,
  initialYear,
}: DateFinanceFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const view = useMemo(() => {
    const v = sp.get('view');
    if (v === 'day' || v === 'year') return v;
    return 'month';
  }, [sp]);

  const navigate = useCallback(
    (next: Record<string, string>) => {
      const p = new URLSearchParams(sp.toString());
      Object.entries(next).forEach(([k, val]) => p.set(k, val));
      router.push(`${pathname}?${p.toString()}`);
    },
    [pathname, router, sp],
  );

  const handleView = (mode: FinanceViewMode) => {
    if (mode === 'day') {
      navigate({ view: 'day', d: sp.get('d') ?? initialDay });
    } else if (mode === 'month') {
      navigate({
        view: 'month',
        y: String(sp.get('y') ?? initialYear),
        m: String(sp.get('m') ?? initialMonth),
      });
    } else {
      navigate({ view: 'year', y: String(sp.get('y') ?? initialYear) });
    }
  };

  const yNow = new Date().getFullYear();
  const YEARS_LIST: number[] = [];
  for (let y = yNow + 2; y >= yNow - 6; y--) YEARS_LIST.push(y);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/40 p-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Período</Label>
        <Tabs value={view} onValueChange={(v) => handleView(v as FinanceViewMode)}>
          <TabsList className="flex w-full flex-wrap sm:w-auto">
            <TabsTrigger value="day" className="text-xs">
              Dia
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs">
              Mês
            </TabsTrigger>
            <TabsTrigger value="year" className="text-xs">
              Ano
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === 'day' && (
        <div className="flex flex-col gap-1 sm:flex-1">
          <Label htmlFor="df-day" className="text-xs text-muted-foreground">
            Dia
          </Label>
          <Input
            id="df-day"
            type="date"
            defaultValue={sp.get('d') ?? initialDay}
            onChange={(e) => navigate({ view: 'day', d: e.target.value })}
            className="max-w-[200px]"
          />
        </div>
      )}

      {view === 'month' && (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Mês</Label>
            <Select
              value={String(Number(sp.get('m') ?? initialMonth))}
              onValueChange={(mv) =>
                navigate({
                  view: 'month',
                  m: mv,
                  y: String(sp.get('y') ?? initialYear),
                })
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.v} value={m.v}>
                    {m.l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ano</Label>
            <Select
              value={String(sp.get('y') ?? initialYear)}
              onValueChange={(yv) =>
                navigate({
                  view: 'month',
                  m: String(sp.get('m') ?? initialMonth),
                  y: yv,
                })
              }
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS_LIST.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {view === 'year' && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Ano</Label>
          <Select
            value={String(sp.get('y') ?? initialYear)}
            onValueChange={(yv) => navigate({ view: 'year', y: yv })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS_LIST.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
