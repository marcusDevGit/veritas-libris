import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from 'fastify-type-provider-zod';
import { AppError } from '../errors/app-error.js';

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string;
  requestId: string;
  details?: { path: string; message: string }[];
}

/**
 * Único ponto de conversão de erros em resposta HTTP.
 * Regra de segurança: erros inesperados (500) nunca devolvem a mensagem original ao cliente,
 * pois ela pode conter detalhes internos (queries, caminhos, nomes de coleções).
 */
export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): void {
  const requestId = String(request.id);

  if (hasZodFastifySchemaValidationErrors(error)) {
    const body: ErrorBody = {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Dados da requisição inválidos',
      requestId,
      details: error.validation.map((issue) => ({
        path: issue.instancePath.replace(/^\//, '').replace(/\//g, '.'),
        message: issue.message ?? 'Valor inválido',
      })),
    };
    void reply.status(400).send(body);
    return;
  }

  if (isResponseSerializationError(error)) {
    request.log.error({ err: error, requestId }, 'Resposta fora do contrato (schema de response)');
    const body: ErrorBody = { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Erro interno do servidor', requestId };
    void reply.status(500).send(body);
    return;
  }

  if (error instanceof AppError) {
    const body: ErrorBody = { statusCode: error.statusCode, code: error.code, message: error.message, requestId };
    void reply.status(error.statusCode).send(body);
    return;
  }

  const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
  if (statusCode >= 400 && statusCode < 500) {
    const errorCode = 'code' in error && typeof error.code === 'string' ? error.code : 'BAD_REQUEST';
    const body: ErrorBody = { statusCode, code: errorCode, message: error.message, requestId };
    void reply.status(statusCode).send(body);
    return;
  }

  request.log.error({ err: error, requestId }, 'Erro não tratado');
  const body: ErrorBody = { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Erro interno do servidor', requestId };
  void reply.status(500).send(body);
}
