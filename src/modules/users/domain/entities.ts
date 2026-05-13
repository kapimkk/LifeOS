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

export interface UserPreferences {
  id: string;
  userId: string;
  theme: string;
  weeklyDigest: boolean;
  emailReminders: boolean;
  pushReminders: boolean;
}

export interface UserWithPreferences extends User {
  preferences: UserPreferences | null;
}
