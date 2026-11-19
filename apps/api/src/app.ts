import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { registerRateLimit } from './plugins/rate-limit.js';
import { bookRoutes } from './routes/books.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { reviewRoutes } from './routes/reviews.routes.js';

/**
 * Monta a aplicação sem iniciar o servidor (listen). Separar app de server permite
 * testar rotas com app.inject() sem abrir porta, e manter server.ts só com o ciclo de vida.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({
    trustProxy: true,
    logger: {
      level: env.LOG_LEVEL,
      redact: ['req.headers.authorization'],
    },
    bodyLimit: 1_048_576,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);

  void app.register(cors, {
    origin: env.CORS_ORIGIN ?? true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  void registerRateLimit(app);

  app.decorateRequest('authUser', null);

  void app.register(healthRoutes);
  void app.register(bookRoutes, { prefix: '/api/v1' });
  void app.register(reviewRoutes, { prefix: '/api/v1' });

  return app;
}
