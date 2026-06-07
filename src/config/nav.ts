import {
  Bookmark,
  Compass,
  Flame,
  LayoutDashboard,
  RefreshCw,
  Settings,
  ShoppingBag,
  Target,
  Wallet,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: 'principal' | 'pessoal';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'principal' },
  { label: 'Jornada', href: '/jornada', icon: Compass, group: 'principal' },
  { label: 'Finanças', href: '/financas/investimentos', icon: Wallet, group: 'principal' },
  { label: 'Desejos', href: '/desejos', icon: ShoppingBag, group: 'principal' },
  { label: 'Metas', href: '/metas', icon: Target, group: 'principal' },
  { label: 'Hábitos', href: '/habitos', icon: Flame, group: 'principal' },
  { label: 'Recursos', href: '/recursos', icon: Bookmark, group: 'principal' },
  { label: 'Roda da Vida', href: '/roda-da-vida', icon: RefreshCw, group: 'principal' },
  { label: 'Perfil', href: '/perfil', icon: User, group: 'pessoal' },
  { label: 'Configurações', href: '/configuracoes', icon: Settings, group: 'pessoal' },
];
