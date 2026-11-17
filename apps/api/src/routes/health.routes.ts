import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { getDatabaseState } from '../config/database.js';

const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  database: z.enum(['disconnected', 'connected', 'connecting', 'disconnecting']),
  uptimeSeconds: z.number(),
  timestamp: z.string(),
});

/**
 * GET /health — usado por Render/Fly.io para saber se a instância está saudável.
 * Retorna 200 só se o banco estiver conectado; caso contrário 503, para a plataforma
 * não direcionar tráfego a uma instância que não consegue atender.
 */
export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        response: { 200: HealthResponseSchema, 503: HealthResponseSchema },
      },
    },
    async (_request, reply) => {
      const database = getDatabaseState();
      const healthy = database === 'connected';

      return reply.status(healthy ? 200 : 503).send({
        status: healthy ? 'ok' : 'degraded',
        database,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    },
  );
};
