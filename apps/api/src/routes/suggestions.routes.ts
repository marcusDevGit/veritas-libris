import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  CreateSuggestionBodySchema,
  ObjectIdSchema,
  SuggestionDtoSchema,
  SuggestionListQuerySchema,
  SuggestionListResponseSchema,
  UpdateSuggestionStatusBodySchema,
} from '@app/shared';
import { requireAuth, requireCurator } from '../middlewares/auth.middleware.js';
import {
  createSuggestion,
  listSuggestions,
  triageSuggestion,
} from '../services/suggestion.service.js';

const SuggestionIdParamsSchema = z.object({
  id: ObjectIdSchema,
});

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
        querystring: SuggestionListQuerySchema,
        response: { 200: SuggestionListResponseSchema },
      },
    },
    async (request) => listSuggestions(request.query),
  );

  app.patch(
    '/suggestions/:id',
    {
      preHandler: [requireAuth, requireCurator],
      schema: {
        params: SuggestionIdParamsSchema,
        body: UpdateSuggestionStatusBodySchema,
        response: { 200: SuggestionDtoSchema },
      },
    },
    async (request) =>
      triageSuggestion(request.params.id, request.body, {
        uid: request.authUser!.uid,
        name: request.authUser!.name,
      }),
  );
};
