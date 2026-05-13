import type { TransactionFilters } from '@/modules/finance/domain/entities';

export type FinanceView = 'day' | 'month' | 'year';

export interface FinanceResolvedPeriod {
  view: FinanceView;
  /** yyyy-MM-DD */
  anchorDayStr: string;
  year: number;
  month: number;
  listFilters: TransactionFilters;
  categoryGte: Date;
  categoryLt: Date;
  headline: string;
  previousPeriod: { kind: FinanceView } & Record<string, string | number>;
}

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function resolveFinancePeriod(
  sp: { view?: string; d?: string; m?: string; y?: string },
  clock: Date = new Date(),
): FinanceResolvedPeriod {
  const yClock = clock.getFullYear();
  const mClock = clock.getMonth();

  const rawView = sp.view ?? 'month';
  const view: FinanceView = rawView === 'day' ? 'day' : rawView === 'year' ? 'year' : 'month';

  const y = Math.min(Math.max(Number(sp.y) || yClock, 1970), 2100);
  const monthRaw = Number(sp.m);
  const m = Number.isFinite(monthRaw) ? Math.min(Math.max(monthRaw, 0), 11) : mClock;

  let anchorDayStr = sp.d ?? '';
  if (!anchorDayStr || !/^\d{4}-\d{2}-\d{2}$/.test(anchorDayStr)) {
    anchorDayStr = isoDay(clock);
  }

  switch (view) {
    case 'day': {
      const [yy, mm, dd] = anchorDayStr.split('-').map((n) => parseInt(n, 10));
      const gte = new Date(yy, mm - 1, dd, 0, 0, 0, 0);
      const categoryLt = new Date(yy, mm - 1, dd + 1, 0, 0, 0, 0);
      const prev = new Date(yy, mm - 1, dd - 1, 12, 0, 0, 0);
      return {
        view,
        anchorDayStr,
        year: yy,
        month: mm - 1,
        listFilters: { day: anchorDayStr },
        categoryGte: gte,
        categoryLt,
        headline: gte.toLocaleDateString('pt-BR'),
        previousPeriod: { kind: 'day', ymd: isoDay(prev) },
      };
    }
    case 'month': {
      const categoryGte = new Date(y, m, 1);
      const categoryLt = new Date(y, m + 1, 1);
      const pm = m === 0 ? 11 : m - 1;
      const py = m === 0 ? y - 1 : y;
      return {
        view,
        anchorDayStr,
        year: y,
        month: m,
        listFilters: { year: y, month: m },
        categoryGte,
        categoryLt,
        headline: new Date(y, m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        previousPeriod: { kind: 'month', py, pm },
      };
    }
    case 'year': {
      const categoryGte = new Date(y, 0, 1);
      const categoryLt = new Date(y + 1, 0, 1);
      return {
        view,
        anchorDayStr,
        year: y,
        month: 0,
        listFilters: { year: y },
        categoryGte,
        categoryLt,
        headline: `${y}`,
        previousPeriod: { kind: 'year', py: y - 1 },
      };
    }
  }
}
