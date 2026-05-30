/**
 * Política de autenticação do LifeOS (JWT próprio, sem NextAuth).
 *
 * Equivalente ao callback `signIn` do Auth.js:
 * @see assertSignInAllowed em `./sign-in-policy.ts`
 *
 * - Registro: `isApproved = false` (lista de espera); sem sessão até aprovação.
 * - Login: rejeita com código `AwaitingApproval` se `isApproved === false`.
 * - Refresh / getCurrentUser: revoga cookies se o usuário não estiver aprovado.
 *
 * Primeiro admin: rode `npm run prisma:seed` ou defina `isApproved: true` no painel do banco.
 */

export const AUTH_ERROR_CODES = {
  AWAITING_APPROVAL: 'AwaitingApproval',
  TOO_MANY_REQUESTS: 'TooManyRequests',
} as const;
