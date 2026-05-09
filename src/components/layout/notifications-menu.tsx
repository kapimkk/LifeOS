'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiFetch } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  link?: string | null;
  createdAt: string;
}

const typeColors: Record<Notification['type'], string> = {
  INFO: 'bg-info',
  SUCCESS: 'bg-success',
  WARNING: 'bg-warning',
  ERROR: 'bg-destructive',
};

export function NotificationsMenu() {
  const [items, setItems] = useState<Notification[]>([]);
  const unread = items.filter((n) => !n.read).length;

  async function load() {
    try {
      const data = await apiFetch<Notification[]>('/api/notifications');
      setItems(data);
    } catch {
      // silencioso
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    await apiFetch('/api/notifications/read-all', { method: 'POST' }).catch(() => null);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
            Notificações
          </DropdownMenuLabel>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3 w-3" /> Marcar todas
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            Tudo em dia. Sem notificações.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-0.5 py-2"
                asChild={!!n.link}
              >
                {n.link ? (
                  <a href={n.link}>
                    <NotificationRow n={n} />
                  </a>
                ) : (
                  <div>
                    <NotificationRow n={n} />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({ n }: { n: Notification }) {
  return (
    <>
      <div className="flex w-full items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${typeColors[n.type]}`} />
        <span className="text-sm font-medium text-foreground">{n.title}</span>
        {!n.read && (
          <span className="ml-auto rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
            novo
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{n.message}</p>
      <p className="text-[10px] text-muted-foreground/60">{formatDateTime(n.createdAt)}</p>
    </>
  );
}
