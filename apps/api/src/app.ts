import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { registerRateLimit } from './plugins/rate-limit.js';
import { registerSecurityHeaders } from './plugins/security-headers.js';
import { adminRoutes } from './routes/admin.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { bookRoutes } from './routes/books.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { notificationRoutes } from './routes/notifications.routes.js';
import { readingListRoutes } from './routes/reading-list.routes.js';
import { reviewRoutes } from './routes/reviews.routes.js';
import { suggestionRoutes } from './routes/suggestions.routes.js';

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
    origin: env.CORS_ORIGIN ?? (env.NODE_ENV === 'production' ? false : true),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['x-request-id'],
  });

  app.addHook('onSend', async (request, reply, payload) => {
    if (!reply.hasHeader('x-request-id')) {
      reply.header('x-request-id', request.id);
    }
    return payload;
  });

  void registerRateLimit(app);
  registerSecurityHeaders(app);

  app.decorateRequest('authUser', null);

  void app.register(healthRoutes);
  void app.register(authRoutes, { prefix: '/api/v1' });
  void app.register(adminRoutes, { prefix: '/api/v1' });
  void app.register(bookRoutes, { prefix: '/api/v1' });
  void app.register(notificationRoutes, { prefix: '/api/v1' });
  void app.register(readingListRoutes, { prefix: '/api/v1' });
  void app.register(reviewRoutes, { prefix: '/api/v1' });
  void app.register(suggestionRoutes, { prefix: '/api/v1' });

  return app;
}
