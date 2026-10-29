import { ApiError } from '@/lib/api';
import { hashPassword } from '@/shared/auth/password';
import { userRepository } from '../../infrastructure/user.repository';

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
  });
}
