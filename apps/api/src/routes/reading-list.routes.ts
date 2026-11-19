import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  AddReadingListBodySchema,
  BookIdParamsSchema,
  ReadingListResponseSchema,
  ReadingListStatusResponseSchema,
} from '@app/shared';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  addBookToReadingList,
  isBookInReadingList,
  listReadingList,
  removeBookFromReadingList,
} from '../services/reading-list.service.js';

export const readingListRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/reading-list',
    {
      preHandler: [requireAuth],
      schema: {
        response: { 200: ReadingListResponseSchema },
      },
    },
    async (request) => listReadingList(request.authUser!.uid),
  );

  app.get(
    '/reading-list/:id/status',
    {
      preHandler: [requireAuth],
      schema: {
        params: BookIdParamsSchema,
        response: { 200: ReadingListStatusResponseSchema },
      },
    },
    async (request) => isBookInReadingList(request.authUser!.uid, request.params.id),
  );

  app.post(
    '/reading-list',
    {
      preHandler: [requireAuth],
      schema: {
        body: AddReadingListBodySchema,
        response: { 200: ReadingListStatusResponseSchema },
      },
    },
    async (request) => addBookToReadingList(request.authUser!.uid, request.body.bookId),
  );

  app.delete(
    '/reading-list/:id',
    {
      preHandler: [requireAuth],
      schema: {
        params: BookIdParamsSchema,
        response: { 200: ReadingListStatusResponseSchema },
      },
    },
    async (request) => removeBookFromReadingList(request.authUser!.uid, request.params.id),
  );
};
