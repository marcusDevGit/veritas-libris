import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  CreateSuggestionBodySchema,
  SuggestionDtoSchema,
  SuggestionListResponseSchema,
} from '@app/shared';
import { requireAuth, requireCurator } from '../middlewares/auth.middleware.js';
import { createSuggestion, listSuggestions } from '../services/suggestion.service.js';

export const suggestionRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/suggestions',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      schema: {
        body: CreateSuggestionBodySchema,
        response: { 201: SuggestionDtoSchema },
      },
    },
    async (request, reply) => {
      const created = await createSuggestion(request.body);
      return reply.status(201).send(created);
    },
  );

  app.get(
    '/suggestions',
    {
      preHandler: [requireAuth, requireCurator],
      schema: {
        response: { 200: SuggestionListResponseSchema },
      },
    },
    async () => ({ items: await listSuggestions() }),
  );
};
