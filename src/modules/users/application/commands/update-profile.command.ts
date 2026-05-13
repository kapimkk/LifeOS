import { userRepository } from '../../infrastructure/user.repository';

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string | null;
  currency?: string;
  locale?: string;
  timezone?: string;
}

export async function updateProfileCommand(userId: string, data: UpdateProfileInput) {
  return userRepository.updateProfile(userId, data);
}
