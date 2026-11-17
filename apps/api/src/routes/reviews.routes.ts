import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  BookIdParamsSchema,
  CreateReviewBodySchema,
  HelpfulVoteResponseSchema,
  ObjectIdSchema,
  PaginatedReviewsSchema,
  ReviewListQuerySchema,
  ReviewSchema,
} from '@app/shared';
import { z } from 'zod';
import { env } from '../config/env.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  listReviewsByBook,
  upsertReview,
  voteReviewHelpful,
} from '../services/review.service.js';

const ReviewIdParamsSchema = z.object({
  id: ObjectIdSchema,
});

export const reviewRoutes: FastifyPluginAsyncZod = async (app) => {
  if (!env.REVIEW_REQUIRES_AUTH) {
    app.log.warn(
      'REVIEW_REQUIRES_AUTH=false: Rotas de avaliação estão PÚBLICAS (use apenas em desenvolvimento).',
    );
  }

  app.post(
    '/books/:id/reviews',
    {
      ...(env.REVIEW_REQUIRES_AUTH ? { preHandler: requireAuth } : {}),
      schema: {
        params: BookIdParamsSchema,
        body: CreateReviewBodySchema,
        response: {
          200: ReviewSchema.extend({ _id: ObjectIdSchema }),
          201: ReviewSchema.extend({ _id: ObjectIdSchema }),
        },
      },
    },
    async (request, reply) => {
      const bookId = request.params.id;

      const userId =
        request.authUser?.uid ?? (request.headers['x-mock-user-id'] as string) ?? 'test-user-1';
      const userName =
        request.authUser?.name ?? (request.headers['x-mock-user-name'] as string) ?? 'Usuário de Teste';
      const isCurator =
        request.authUser?.isCurator ?? (request.headers['x-mock-curator'] === 'true');

      const review = await upsertReview({
        bookId,
        userId,
        userName,
        isCurator,
        data: request.body,
      });

      return reply.status(200).send(review);
    },
  );

  app.get(
    '/books/:id/reviews',
    {
      schema: {
        params: BookIdParamsSchema,
        querystring: ReviewListQuerySchema,
        response: {
          200: PaginatedReviewsSchema,
        },
      },
    },
    async (request) => {
      return listReviewsByBook(request.params.id, request.query);
    },
  );

  app.post(
    '/reviews/:id/helpful',
    {
      ...(env.REVIEW_REQUIRES_AUTH ? { preHandler: requireAuth } : {}),
      schema: {
        params: ReviewIdParamsSchema,
        response: {
          200: HelpfulVoteResponseSchema,
        },
      },
    },
    async (request) => {
      const reviewId = request.params.id;
      const userId =
        request.authUser?.uid ?? (request.headers['x-mock-user-id'] as string) ?? 'test-user-1';

      return voteReviewHelpful(reviewId, userId);
    },
  );
};
