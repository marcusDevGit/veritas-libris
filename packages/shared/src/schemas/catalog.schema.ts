import { z } from 'zod';
import { AdequacyLevelSchema, AgeRatingSchema } from '../constants/doctrine.js';
import { BookSchema, Isbn13Schema, ObjectIdSchema } from './book.schema.js';

/**
 * Contratos HTTP do catálogo. Ficam no @app/shared para a API validar a entrada
 * e o frontend (Fase 5) tipar as chamadas com exatamente o mesmo schema.
 */


/** Livro persistido: igual ao BookSchema, mas com `_id` obrigatório (string de 24 hex). */
export const BookDtoSchema = BookSchema.extend({ _id: ObjectIdSchema });
export type BookDto = z.infer<typeof BookDtoSchema>;


const TagsQuerySchema = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  )
  .pipe(z.array(z.string().max(40)).max(10, 'No máximo 10 tags por consulta'));

const BooleanQueryParamSchema = z
  .union([
    z.boolean(),
    z.enum(['true', 'false']).transform((value) => value === 'true'),
  ]);

export const BookSortOptionSchema = z.enum([
  'most-reviewed',
  'recent',
  'strict-moral',
  'alphabetical',
]);
export type BookSortOption = z.infer<typeof BookSortOptionSchema>;

export const BookStampFilterSchema = z.enum(['imprimatur', 'classico-cristao']);
export type BookStampFilter = z.infer<typeof BookStampFilterSchema>;

export const BookListQuerySchema = z.object({
  /** Busca textual (título, subtítulo, autores). Vai para o índice `text` do Mongo; nunca para regex. */
  q: z.string().trim().min(1).max(100).optional(),
  adequacy: AdequacyLevelSchema.optional(),
  age: AgeRatingSchema.optional(),
  /** Lista separada por vírgula: `tags=romance,classico`. O livro precisa ter TODAS. */
  tags: TagsQuerySchema.optional(),
  familyMode: BooleanQueryParamSchema.optional(),
  hasImprimatur: BooleanQueryParamSchema.optional(),
  stamp: BookStampFilterSchema.optional(),
  sort: BookSortOptionSchema.default('most-reviewed'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type BookListQuery = z.infer<typeof BookListQuerySchema>;

export const CatalogStatsSchema = z.object({
  totalAll: z.number().int().nonnegative(),
  reviewed: z.number().int().nonnegative(),
  recommended: z.number().int().nonnegative(),
  withReservations: z.number().int().nonnegative(),
  notRecommended: z.number().int().nonnegative(),
});
export type CatalogStats = z.infer<typeof CatalogStatsSchema>;

export const PaginatedBooksSchema = z.object({
  items: z.array(BookDtoSchema),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  stats: CatalogStatsSchema,
});
export type PaginatedBooks = z.infer<typeof PaginatedBooksSchema>;


export const BookIdParamsSchema = z.object({ id: ObjectIdSchema });


export const ExternalSearchQuerySchema = z.object({
  /** ISBN (10 ou 13, com ou sem hífen) ou texto livre (título/autor). */
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});
export type ExternalSearchQuery = z.infer<typeof ExternalSearchQuerySchema>;

/** Dados bibliográficos vindos da Google Books, já normalizados. Nunca inclui campos de curadoria. */
export const ExternalBookSchema = BookSchema.pick({
  isbn13: true,
  googleBooksId: true,
  title: true,
  subtitle: true,
  authors: true,
  coverUrl: true,
  synopsis: true,
  publishedYear: true,
  publisher: true,
  pageCount: true,
  language: true,
});
export type ExternalBook = z.infer<typeof ExternalBookSchema>;

export const ExternalBookResultSchema = ExternalBookSchema.extend({
  alreadyImported: z.boolean(),
  /** Presente quando `alreadyImported` é true, para o frontend linkar a página do livro. */
  localBookId: ObjectIdSchema.optional(),
});
export type ExternalBookResult = z.infer<typeof ExternalBookResultSchema>;

export const ExternalSearchResponseSchema = z.object({
  items: z.array(ExternalBookResultSchema),
});


/**
 * O cliente envia APENAS o ISBN. Título, capa, etc. são buscados pelo servidor,
 * para que ninguém consiga cadastrar dados falsos (ex.: hasImprimatur: true).
 */
export const ImportBookBodySchema = z.object({ isbn13: Isbn13Schema });
export type ImportBookBody = z.infer<typeof ImportBookBodySchema>;

export const ImportBookResponseSchema = z.object({
  /** `true` se o livro foi criado agora; `false` se já existia (importar de novo é seguro). */
  created: z.boolean(),
  book: BookDtoSchema,
});
export type ImportBookResponse = z.infer<typeof ImportBookResponseSchema>;
