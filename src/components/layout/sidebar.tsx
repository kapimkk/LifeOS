'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const grouped = {
    principal: NAV_ITEMS.filter((i) => i.group === 'principal'),
    pessoal: NAV_ITEMS.filter((i) => i.group === 'pessoal'),
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          LifeOS
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        <NavGroup label="Principal" items={grouped.principal} pathname={pathname} />
        <NavGroup label="Conta" items={grouped.pessoal} pathname={pathname} />
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4">
          <p className="text-xs font-medium text-foreground">Em evolução</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mais módulos chegando: pomodoro, calendário e relatórios.
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: typeof NAV_ITEMS;
  pathname: string;
}) {
  return (
    <div>
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-sidebar-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
