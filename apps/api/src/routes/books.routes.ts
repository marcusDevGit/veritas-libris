import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  BookDtoSchema,
  BookIdParamsSchema,
  BookListQuerySchema,
  CurationQueueQuerySchema,
  CurationQueueResponseSchema,
  EditorialAiDraftResponseSchema,
  ExternalSearchQuerySchema,
  ExternalSearchResponseSchema,
  ImportBookBodySchema,
  ImportBookResponseSchema,
  PaginatedBooksSchema,
  UpdateBookEditorialBodySchema,
} from "@app/shared";
import { env } from "../config/env.js";
import { requireAuth, requireCurator } from "../middlewares/auth.middleware.js";
import { BOOK_RATE_LIMITS } from "../plugins/rate-limit.js";
import {
  getBookById,
  importBookByIsbn,
  listBooks,
  markAlreadyImported,
  refreshBookMetadata,
} from "../services/book.service.js";
import {
  listCurationBooks,
  updateBookEditorial,
} from "../services/curation.service.js";
import { searchGoogleBooks } from "../services/google-books.service.js";
import { generateEditorialAiDraft } from "../services/magisterium.service.js";

/**
 * Rotas HTTP do catálogo. Só traduzem HTTP <-> services: nenhuma regra de negócio aqui.
 * Registradas com prefixo /api/v1 em app.ts.
 */
export const bookRoutes: FastifyPluginAsyncZod = async (app) => {
  if (!env.IMPORT_REQUIRES_AUTH) {
    app.log.warn(
      "IMPORT_REQUIRES_AUTH=false: POST /books/import está PÚBLICO (use só em desenvolvimento).",
    );
  }

  app.get(
    "/books",
    {
      schema: {
        querystring: BookListQuerySchema,
        response: { 200: PaginatedBooksSchema },
      },
    },
    async (request) => listBooks(request.query),
  );

  app.get(
    "/books/external-search",
    {
      config: {
        rateLimit: BOOK_RATE_LIMITS.externalSearch,
      },
      schema: {
        querystring: ExternalSearchQuerySchema,
        response: { 200: ExternalSearchResponseSchema },
      },
    },
    async (request) => {
      const { q, limit } = request.query;
      const found = await searchGoogleBooks(q, limit, {
        apiKey: env.GOOGLE_BOOKS_API_KEY,
      });
      return { items: await markAlreadyImported(found) };
    },
  );

  app.get(
    "/books/:id",
    {
      schema: {
        params: BookIdParamsSchema,
        response: { 200: BookDtoSchema },
      },
    },
    async (request) => getBookById(request.params.id),
  );

  app.post(
    "/books/import",
    {
      ...(env.IMPORT_REQUIRES_AUTH ? { preHandler: requireAuth } : {}),
      config: {
        rateLimit: BOOK_RATE_LIMITS.importBook,
      },
      schema: {
        body: ImportBookBodySchema,
        response: { 200: ImportBookResponseSchema, 201: ImportBookResponseSchema },
      },
    },
    async (request, reply) => {
      const result = await importBookByIsbn(request.body.isbn13);
      return reply.status(result.created ? 201 : 200).send(result);
    },
  );

  app.patch(
    "/books/:id/refresh-metadata",
    {
      config: {
        rateLimit: BOOK_RATE_LIMITS.refreshMetadata,
      },
      schema: {
        params: BookIdParamsSchema,
        response: { 200: BookDtoSchema },
      },
    },
    async (request) => refreshBookMetadata(request.params.id),
  );

  app.get(
    "/curation/books",
    {
      preHandler: [requireAuth, requireCurator],
      schema: {
        querystring: CurationQueueQuerySchema,
        response: { 200: CurationQueueResponseSchema },
      },
    },
    async (request) => listCurationBooks(request.query),
  );

  app.patch(
    "/books/:id/editorial",
    {
      preHandler: [requireAuth, requireCurator],
      schema: {
        params: BookIdParamsSchema,
        body: UpdateBookEditorialBodySchema,
        response: { 200: BookDtoSchema },
      },
    },
    async (request) =>
      updateBookEditorial(request.params.id, request.body, {
        uid: request.authUser!.uid,
        name: request.authUser!.name,
        email: request.authUser!.email,
      }),
  );

  app.post(
    "/curation/books/:id/ai-draft",
    {
      preHandler: [requireAuth, requireCurator],
      config: {
        rateLimit: BOOK_RATE_LIMITS.aiDraft,
      },
      schema: {
        params: BookIdParamsSchema,
        response: { 200: EditorialAiDraftResponseSchema },
      },
    },
    async (request) =>
      generateEditorialAiDraft(request.params.id, {
        uid: request.authUser!.uid,
        name: request.authUser!.name,
      }),
  );
};
