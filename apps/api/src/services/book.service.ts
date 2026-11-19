import type { ModifyResult, Types } from "mongoose";
import type {
  BookDto,
  BookListQuery,
  ExternalBook,
  ExternalBookResult,
  PaginatedBooks,
} from "@app/shared";
import { env } from "../config/env.js";
import { NotFoundError } from "../errors/app-error.js";
import { BookModel, type BookAttrs } from "../models/Book.model.js";
import { findGoogleBookByIsbn } from "./google-books.service.js";
import { enrichWithFallbackProviders } from "./external-books-providers.service.js";

/** Forma de um documento `lean()` do Book (objeto simples, sem métodos do Mongoose). */
export type BookLean = BookAttrs & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Converte o documento do Mongo no contrato da API:
 * ObjectId vira string (o JSON do cliente não conhece ObjectId) e campos
 * internos do Mongo (__v, score de busca) ficam de fora de propósito.
 */
export function toBookDto(doc: BookLean): BookDto {
  return {
    _id: doc._id.toString(),
    isbn13: doc.isbn13,
    googleBooksId: doc.googleBooksId,
    title: doc.title,
    subtitle: doc.subtitle,
    authors: doc.authors,
    coverUrl: doc.coverUrl,
    synopsis: doc.synopsis,
    publishedYear: doc.publishedYear,
    publisher: doc.publisher,
    pageCount: doc.pageCount,
    language: doc.language,
    hasImprimatur: doc.hasImprimatur,
    editorialLock: doc.editorialLock ?? false,
    editorialLockedAt: doc.editorialLockedAt,
    editorialLockedBy: doc.editorialLockedBy,
    adequacyStatus: doc.adequacyStatus,
    recommendedAge: doc.recommendedAge,
    tags: doc.tags,
    editorialSummary: doc.editorialSummary,
    reservations: doc.reservations,
    alternatives: doc.alternatives.map((id) => id.toString()),
    communityStats: doc.communityStats,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}


export async function listBooks(query: BookListQuery): Promise<PaginatedBooks> {
  const { q, adequacy, age, tags, page, limit } = query;

  const filter: Record<string, unknown> = {};
  if (q) filter["$text"] = { $search: q };
  if (adequacy) filter["adequacyStatus"] = adequacy;
  if (age) filter["recommendedAge"] = age;
  if (tags && tags.length > 0) filter["tags"] = { $all: tags };

  const [docs, total] = await Promise.all([
    q
      ? BookModel.find(filter, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" } })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean<BookLean[]>()
      : BookModel.find(filter)
          .sort({ title: 1, _id: 1 }) // _id desempata: paginação estável.
          .skip((page - 1) * limit)
          .limit(limit)
          .lean<BookLean[]>(),
    BookModel.countDocuments(filter),
  ]);

  return {
    items: docs.map(toBookDto),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBookById(id: string): Promise<BookDto> {
  const doc = await BookModel.findById(id).lean<BookLean>();
  if (!doc) throw new NotFoundError("Livro não encontrado");
  return toBookDto(doc);
}


/** Marca quais resultados da Google já existem no nosso banco (uma única consulta). */
export async function markAlreadyImported(
  books: ExternalBook[],
): Promise<ExternalBookResult[]> {
  if (books.length === 0) return [];

  const existing = await BookModel.find(
    { isbn13: { $in: books.map((book) => book.isbn13) } },
    { isbn13: 1 },
  ).lean<{ _id: Types.ObjectId; isbn13: string }[]>();

  const idByIsbn = new Map(existing.map((doc) => [doc.isbn13, doc._id.toString()]));

  return books.map((book) => {
    const localBookId = idByIsbn.get(book.isbn13);
    return localBookId
      ? { ...book, alreadyImported: true, localBookId }
      : { ...book, alreadyImported: false };
  });
}

export interface ImportResult {
  created: boolean;
  book: BookDto;
}

/** Dados de curadoria de um livro recém-importado: sempre o padrão mais conservador. */
function curationDefaults(): Pick<
  BookAttrs,
  | "hasImprimatur"
  | "editorialLock"
  | "adequacyStatus"
  | "recommendedAge"
  | "tags"
  | "reservations"
  | "communityStats"
> & { alternatives: never[] } {
  return {
    hasImprimatur: false,
    editorialLock: false,
    adequacyStatus: "UNRATED",
    recommendedAge: "ALL",
    tags: [],
    reservations: [],
    alternatives: [],
    communityStats: {
      totalReviews: 0,
      recommendedCount: 0,
      reservationsCount: 0,
      notRecommendedCount: 0,
    },
  };
}

/** E11000 = violação de índice único (outro request criou o mesmo ISBN no mesmo instante). */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

/**
 * Importa um livro pelo ISBN-13, de forma idempotente:
 *  1. Já existe no banco? Devolve o existente (não gasta cota da Google).
 *  2. Busca na Google. Não achou -> 404.
 *  3. Upsert com `$setOnInsert`: se dois requests chegarem juntos, só um insere,
 *     e nada do que já está salvo (inclusive curadoria) é sobrescrito.
 */
export async function importBookByIsbn(isbn13: string): Promise<ImportResult> {
  const existing = await BookModel.findOne({ isbn13 }).lean<BookLean>();
  if (existing) return { created: false, book: toBookDto(existing) };

  const googleExternal = await findGoogleBookByIsbn(isbn13, {
    apiKey: env.GOOGLE_BOOKS_API_KEY,
  });
  const external = await enrichWithFallbackProviders(isbn13, googleExternal);
  if (!external) {
    throw new NotFoundError("Nenhum livro encontrado nas bases externas para este ISBN");
  }

  const insertOnly = { ...external, ...curationDefaults() };

  try {
    const result = await BookModel.findOneAndUpdate(
      { isbn13 },
      { $setOnInsert: insertOnly },
      {
        upsert: true,
        returnDocument: "after",
        includeResultMetadata: true,
        runValidators: true,
      },
    ).lean<ModifyResult<BookLean>>();

    if (!result.value) {
      throw new Error("Upsert não retornou o documento");
    }

    return {
      created: result.lastErrorObject?.updatedExisting === false,
      book: toBookDto(result.value),
    };
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;

    const winner = await BookModel.findOne({ isbn13 }).lean<BookLean>();
    if (!winner) throw error;
    return { created: false, book: toBookDto(winner) };
  }
}

export async function refreshBookMetadata(id: string): Promise<BookDto> {
  const existing = await BookModel.findById(id).lean<BookLean>();
  if (!existing) throw new NotFoundError("Livro não encontrado");

  const googleExternal = await findGoogleBookByIsbn(existing.isbn13, {
    apiKey: env.GOOGLE_BOOKS_API_KEY,
  });
  const enriched = await enrichWithFallbackProviders(existing.isbn13, googleExternal);
  if (!enriched) return toBookDto(existing);

  const updates: Record<string, unknown> = {};
  if (!existing.publisher && enriched.publisher) updates["publisher"] = enriched.publisher;
  if (!existing.pageCount && enriched.pageCount) updates["pageCount"] = enriched.pageCount;
  if (!existing.language && enriched.language) updates["language"] = enriched.language;
  if (!existing.coverUrl && enriched.coverUrl) updates["coverUrl"] = enriched.coverUrl;
  if (!existing.publishedYear && enriched.publishedYear) updates["publishedYear"] = enriched.publishedYear;

  const isExistingPt = existing.language?.toLowerCase().startsWith("pt") ?? false;
  const isEnrichedPt = enriched.language?.toLowerCase().startsWith("pt") ?? false;
  if ((!existing.synopsis || (!isExistingPt && isEnrichedPt)) && enriched.synopsis) {
    updates["synopsis"] = enriched.synopsis;
    if (enriched.language) updates["language"] = enriched.language;
  }

  if (Object.keys(updates).length === 0) {
    return toBookDto(existing);
  }

  const updated = await BookModel.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after", runValidators: true },
  ).lean<BookLean>();

  if (!updated) throw new NotFoundError("Livro não encontrado");
  return toBookDto(updated);
}
