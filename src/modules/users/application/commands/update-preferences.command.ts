import { userRepository } from '../../infrastructure/user.repository';

export interface UpdatePreferencesInput {
  theme?: string;
  weeklyDigest?: boolean;
  emailReminders?: boolean;
  pushReminders?: boolean;
}

export async function updatePreferencesCommand(userId: string, data: UpdatePreferencesInput) {
  return userRepository.upsertPreferences(userId, data);
}
