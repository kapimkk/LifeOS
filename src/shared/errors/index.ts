export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = 'Não autenticado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message = 'Recurso não encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = 'Acesso negado') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  status = 409;
  constructor(message = 'Conflito de dados') {
    super(message);
    this.name = 'ConflictError';
  }
}
