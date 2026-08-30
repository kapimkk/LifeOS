'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 lg:hidden"
            style={{ zIndex: 9998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <motion.aside
            className="fixed inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border lg:hidden"
            style={{ zIndex: 9999, backgroundColor: 'hsl(var(--sidebar-bg))' }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-base font-semibold text-sidebar-foreground">LifeOS</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
              <NavGroup
                label="Principal"
                items={NAV_ITEMS.filter((i) => i.group === 'principal')}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
              <NavGroup
                label="Sistema"
                items={NAV_ITEMS.filter((i) => i.group === 'sistema')}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      {mounted && createPortal(drawer, document.body)}
    </>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: typeof NAV_ITEMS;
  pathname: string;
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-6">
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
