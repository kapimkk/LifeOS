import 'server-only';
import { AwaitingApprovalError } from '@/shared/errors/awaiting-approval';

/**
 * Equivalente ao callback `signIn` do Auth.js / NextAuth:
 * bloqueia sessão para usuários com `isApproved === false`.
 */
export function assertSignInAllowed(user: { isApproved: boolean }): void {
  if (!user.isApproved) {
    throw new AwaitingApprovalError();
  }
}
