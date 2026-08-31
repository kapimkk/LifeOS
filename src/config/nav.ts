import {
  Bookmark,
  CalendarClock,
  Compass,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: 'principal' | 'sistema';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'principal' },
  { label: 'Rotina', href: '/rotina', icon: CalendarClock, group: 'principal' },
  { label: 'Jornada', href: '/jornada', icon: Compass, group: 'principal' },
  { label: 'Finanças', href: '/financas/investimentos', icon: Wallet, group: 'principal' },
  { label: 'Desejos', href: '/desejos', icon: ShoppingBag, group: 'principal' },
  { label: 'Recursos', href: '/recursos', icon: Bookmark, group: 'principal' },
  { label: 'Configurações', href: '/configuracoes', icon: Settings, group: 'sistema' },
];
