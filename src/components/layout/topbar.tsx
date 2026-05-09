import { MobileNav } from './mobile-nav';
import { NotificationsMenu } from './notifications-menu';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

interface TopbarProps {
  user: { name: string; email: string; avatarUrl?: string | null };
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <MobileNav />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NotificationsMenu />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
