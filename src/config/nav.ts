import {
  Bookmark,
  CheckSquare,
  Flame,
  LayoutDashboard,
  Settings,
  Target,
  User,
  Wallet,
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
  { label: 'Finanças', href: '/financas', icon: Wallet, group: 'principal' },
  { label: 'Metas', href: '/metas', icon: Target, group: 'principal' },
  { label: 'Hábitos', href: '/habitos', icon: Flame, group: 'principal' },
  { label: 'Tarefas', href: '/tarefas', icon: CheckSquare, group: 'principal' },
  { label: 'Recursos', href: '/recursos', icon: Bookmark, group: 'principal' },
  { label: 'Perfil', href: '/perfil', icon: User, group: 'pessoal' },
  { label: 'Configurações', href: '/configuracoes', icon: Settings, group: 'pessoal' },
];
