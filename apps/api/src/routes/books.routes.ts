import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  BookDtoSchema,
  BookIdParamsSchema,
  BookListQuerySchema,
  ExternalSearchQuerySchema,
  ExternalSearchResponseSchema,
  ImportBookBodySchema,
  ImportBookResponseSchema,
  PaginatedBooksSchema,
} from "@app/shared";
import { env } from "../config/env.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  getBookById,
  importBookByIsbn,
  listBooks,
  markAlreadyImported,
} from "../services/book.service.js";
import { searchGoogleBooks } from "../services/google-books.service.js";

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
};
