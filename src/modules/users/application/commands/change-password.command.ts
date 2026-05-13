import { ApiError } from '@/lib/api';
import { comparePassword, hashPassword } from '@/shared/auth/password';
import { userRepository } from '../../infrastructure/user.repository';

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changePasswordCommand(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await userRepository.findByIdWithHash(userId);
  if (!user) throw new ApiError(404, 'Usuário não encontrado');

  const valid = await comparePassword(input.currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(400, 'Senha atual incorreta');

  const newHash = await hashPassword(input.newPassword);
  await userRepository.updatePasswordHash(userId, newHash);
}
