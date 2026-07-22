export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  currency: string;
  locale: string;
  timezone: string;
  onboardedAt: Date | null;
}
