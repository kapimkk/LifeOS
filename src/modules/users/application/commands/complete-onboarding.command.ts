import { userRepository } from '../../infrastructure/user.repository';

export async function completeOnboardingCommand(userId: string): Promise<void> {
  await userRepository.updateOnboarding(userId);
}
