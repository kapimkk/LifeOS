'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarClock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/financas/investimentos', label: 'Investimentos', icon: TrendingUp },
  { href: '/financas/gastos-fixos', label: 'Gastos Fixos', icon: CalendarClock },
] as const;

export function FinanceHubTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-3">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
