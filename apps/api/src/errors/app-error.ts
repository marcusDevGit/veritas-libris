/**
 * Erro "esperado" de negócio/HTTP. O error handler central o converte em resposta
 * com o statusCode correto. Qualquer outro erro é tratado como 500 genérico.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'APP_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Autenticação necessária') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(404, message, 'NOT_FOUND');
  }
}

/** Serviço externo (ex.: Google Books) respondeu com erro ou algo inválido. */
export class ExternalServiceError extends AppError {
  constructor(message = 'Serviço externo indisponível no momento') {
    super(502, message, 'EXTERNAL_SERVICE_ERROR');
  }
}

/** Serviço externo não respondeu dentro do tempo limite. */
export class ExternalServiceTimeoutError extends AppError {
  constructor(message = 'Serviço externo demorou demais para responder') {
    super(504, message, 'EXTERNAL_SERVICE_TIMEOUT');
  }
}
