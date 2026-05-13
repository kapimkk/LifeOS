import { type TransactionType } from '@prisma/client';
import { ApiError } from '@/lib/api';
import { hashPassword } from '@/shared/auth/password';
import { userRepository } from '../../infrastructure/user.repository';

// Default categories seeded for every new user.
// In a full event-driven architecture, this would be handled by the finance
// module subscribing to a UserRegistered domain event.
const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', color: '#f97316', icon: 'utensils', type: 'EXPENSE' },
  { name: 'Transporte', color: '#3b82f6', icon: 'car', type: 'EXPENSE' },
  { name: 'Lazer', color: '#a855f7', icon: 'gamepad-2', type: 'EXPENSE' },
  { name: 'Estudos', color: '#06b6d4', icon: 'book-open', type: 'EXPENSE' },
  { name: 'Moradia', color: '#ef4444', icon: 'home', type: 'EXPENSE' },
  { name: 'Saúde', color: '#10b981', icon: 'heart-pulse', type: 'EXPENSE' },
  { name: 'Investimentos', color: '#22c55e', icon: 'trending-up', type: 'EXPENSE' },
  { name: 'Outros', color: '#94a3b8', icon: 'tag', type: 'EXPENSE' },
  { name: 'Salário', color: '#16a34a', icon: 'wallet', type: 'INCOME' },
  { name: 'Freelance', color: '#0ea5e9', icon: 'briefcase', type: 'INCOME' },
  { name: 'Rendimentos', color: '#84cc16', icon: 'coins', type: 'INCOME' },
] satisfies Array<{ name: string; color: string; icon: string; type: TransactionType }>;

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function registerUserCommand(input: RegisterUserInput): Promise<RegisterUserResult> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) throw new ApiError(409, 'Já existe uma conta com este e-mail');

  const passwordHash = await hashPassword(input.password);

  return userRepository.create({
    name: input.name,
    email: input.email,
    passwordHash,
    defaultCategories: DEFAULT_CATEGORIES,
  });
}
