import type { FastifyInstance, FastifyRequest } from 'fastify';
import rateLimit from '@fastify/rate-limit';

export const BOOK_RATE_LIMITS = {
  externalSearch: {
    max: 20,
    timeWindow: '1 minute',
  },
  importBook: {
    max: 10,
    timeWindow: '1 minute',
    keyGenerator: (request: FastifyRequest) => request.authUser?.uid ?? request.ip,
  },
  refreshMetadata: {
    max: 10,
    timeWindow: '1 minute',
  },
  aiDraft: {
    max: 5,
    timeWindow: '1 minute',
    keyGenerator: (request: FastifyRequest) => request.authUser?.uid ?? request.ip,
  },
} as const;

/**
 * Registra o plugin @fastify/rate-limit com modo opt-in (global: false)
 * para proteger apenas rotas que consomem APIs externas ou realizam escrita sensível.
 */
export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Muitas requisições em sequência. Tente novamente em ${context.after}.`,
    }),
  });
}
