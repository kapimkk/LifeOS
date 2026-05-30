/** Conta criada mas ainda não liberada pelo administrador (whitelist). */
export class AwaitingApprovalError extends Error {
  readonly code = 'AwaitingApproval' as const;
  readonly status = 403;

  constructor(
    message = 'Sua conta foi criada com sucesso, mas está aguardando a liberação do administrador.',
  ) {
    super(message);
    this.name = 'AwaitingApprovalError';
  }
}
