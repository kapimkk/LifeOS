import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/shared/auth/session';
import { completeOnboardingCommand } from '@/modules/users/application/commands/complete-onboarding.command';

export async function POST() {
  try {
    const user = await requireUser();
    await completeOnboardingCommand(user.id);
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
