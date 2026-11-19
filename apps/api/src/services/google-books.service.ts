import { z } from "zod";
import {
  isbn10ToIsbn13,
  isValidIsbn10,
  isValidIsbn13,
  normalizeIsbn,
  stripIsbn,
  type ExternalBook,
} from "@app/shared";
import {
  ExternalServiceError,
  ExternalServiceTimeoutError,
} from "../errors/app-error.js";

const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_SYNOPSIS_LENGTH = 5_000;
const UNKNOWN_AUTHOR = "Autor não informado";

/**
 * Schema TOLERANTE da resposta da Google: quase tudo é opcional porque a API é
 * inconsistente entre livros. Isto valida o formato recebido (dado não confiável);
 * a conversão para o nosso contrato acontece em `mapGoogleVolume`.
 */
const GoogleVolumeSchema = z.object({
  id: z.string().min(1),
  volumeInfo: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    authors: z.array(z.string()).optional(),
    description: z.string().optional(),
    publishedDate: z.string().optional(),
    publisher: z.string().optional(),
    pageCount: z.number().optional(),
    language: z.string().optional(),
    imageLinks: z
      .object({
        thumbnail: z.string().optional(),
        smallThumbnail: z.string().optional(),
      })
      .optional(),
    industryIdentifiers: z
      .array(z.object({ type: z.string(), identifier: z.string() }))
      .optional(),
  }),
});

const GoogleResponseSchema = z.object({
  items: z.array(z.unknown()).optional(),
});

type GoogleVolume = z.infer<typeof GoogleVolumeSchema>;


/** Prefere ISBN_13; se só houver ISBN_10, converte. Ignora identificadores inválidos. */
export function extractIsbn13(
  identifiers: GoogleVolume["volumeInfo"]["industryIdentifiers"],
): string | null {
  if (!identifiers) return null;

  for (const { type, identifier } of identifiers) {
    if (type !== "ISBN_13") continue;
    const cleaned = stripIsbn(identifier);
    if (isValidIsbn13(cleaned)) return cleaned;
  }

  for (const { type, identifier } of identifiers) {
    if (type !== "ISBN_10") continue;
    const cleaned = stripIsbn(identifier);
    if (isValidIsbn10(cleaned)) return isbn10ToIsbn13(cleaned);
  }

  return null;
}

/**
 * Capa: força https, remove o efeito "página curvada" (edge=curl) e só aceita
 * hosts do Google. Evita mixed content e que uma URL de terceiros (rastreador)
 * entre no nosso banco.
 */
export function normalizeCoverUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    const host = url.hostname;
    const isGoogleHost =
      host === "google.com" ||
      host.endsWith(".google.com") ||
      host.endsWith(".googleusercontent.com");
    if (!isGoogleHost) return undefined;

    url.protocol = "https:";
    url.searchParams.delete("edge");
    return url.toString();
  } catch {
    return undefined;
  }
}

/** Descrições da Google vêm com HTML (<p>, <br>, <b>). Guardamos texto puro. */
export function stripHtml(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  const text = raw
    .replace(/<\/?(p|br|div|li|ul|ol|h[1-6])\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length === 0) return undefined;
  return text.slice(0, MAX_SYNOPSIS_LENGTH);
}

/** "2019", "2019-05" e "2019-05-20" -> 2019. Fora de um intervalo plausível -> undefined. */
export function parsePublishedYear(raw: string | undefined): number | undefined {
  if (!raw) return undefined;

  const match = /^(\d{4})/.exec(raw);
  if (!match?.[1]) return undefined;

  const year = Number(match[1]);
  const maxYear = new Date().getFullYear() + 1;
  return year >= 1 && year <= maxYear ? year : undefined;
}

/**
 * Converte um volume bruto da Google em ExternalBook.
 * Devolve `null` quando o item não serve (sem título ou sem ISBN válido):
 * sem ISBN-13 não conseguimos garantir unicidade no catálogo.
 */
export function mapGoogleVolume(rawVolume: unknown): ExternalBook | null {
  const parsed = GoogleVolumeSchema.safeParse(rawVolume);
  if (!parsed.success) return null;

  const { id, volumeInfo } = parsed.data;

  const title = volumeInfo.title?.trim();
  if (!title) return null;

  const isbn13 = extractIsbn13(volumeInfo.industryIdentifiers);
  if (!isbn13) return null;

  const authors = (volumeInfo.authors ?? [])
    .map((author) => author.trim())
    .filter((author) => author.length > 0);

  const subtitle = volumeInfo.subtitle?.trim();
  const coverUrl = normalizeCoverUrl(
    volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail,
  );
  const synopsis = stripHtml(volumeInfo.description);
  const publishedYear = parsePublishedYear(volumeInfo.publishedDate);
  const publisher = volumeInfo.publisher?.trim() || undefined;
  const pageCount =
    typeof volumeInfo.pageCount === 'number' && volumeInfo.pageCount > 0
      ? Math.floor(volumeInfo.pageCount)
      : undefined;
  const language = volumeInfo.language?.trim() || undefined;

  return {
    isbn13,
    googleBooksId: id,
    title,
    authors: authors.length > 0 ? authors : [UNKNOWN_AUTHOR],
    ...(subtitle ? { subtitle } : {}),
    ...(coverUrl ? { coverUrl } : {}),
    ...(synopsis ? { synopsis } : {}),
    ...(publishedYear ? { publishedYear } : {}),
    ...(publisher ? { publisher } : {}),
    ...(pageCount ? { pageCount } : {}),
    ...(language ? { language } : {}),
  };
}


export interface GoogleBooksOptions {
  apiKey?: string | undefined;
}

async function fetchVolumes(
  query: string,
  maxResults: number,
  { apiKey }: GoogleBooksOptions,
  langRestrict?: string,
): Promise<unknown[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
    printType: "books",
    fields:
      "items(id,volumeInfo(title,subtitle,authors,description,publishedDate,publisher,pageCount,language,imageLinks,industryIdentifiers))",
  });
  if (langRestrict) params.set("langRestrict", langRestrict);
  if (apiKey) params.set("key", apiKey);

  let response: Response;
  try {
    response = await fetch(`${GOOGLE_BOOKS_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new ExternalServiceTimeoutError();
    }
    throw new ExternalServiceError();
  }

  if (!response.ok) {
    throw new ExternalServiceError();
  }

  const body: unknown = await response.json().catch(() => null);
  const parsed = GoogleResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new ExternalServiceError();
  }

  return parsed.data.items ?? [];
}

function dedupeByIsbn(books: ExternalBook[]): ExternalBook[] {
  const seen = new Set<string>();
  return books.filter((book) => {
    if (seen.has(book.isbn13)) return false;
    seen.add(book.isbn13);
    return true;
  });
}

/**
 * Busca por ISBN (qualquer formato válido) ou por texto livre.
 * Se `query` for um ISBN válido, usa o operador `isbn:` da Google (resultado exato).
 */
export async function searchGoogleBooks(
  query: string,
  limit: number,
  options: GoogleBooksOptions = {},
): Promise<ExternalBook[]> {
  const isbn13 = normalizeIsbn(query);
  if (isbn13) {
    const items = await fetchVolumes(`isbn:${isbn13}`, limit, options);
    const books = items
      .map(mapGoogleVolume)
      .filter((book): book is ExternalBook => book !== null);
    return dedupeByIsbn(books);
  }

  const ptItems = await fetchVolumes(query, limit, options, "pt");
  let books = ptItems
    .map(mapGoogleVolume)
    .filter((book): book is ExternalBook => book !== null);

  if (books.length < limit) {
    const globalItems = await fetchVolumes(query, limit, options);
    const globalBooks = globalItems
      .map(mapGoogleVolume)
      .filter((book): book is ExternalBook => book !== null);
    books = [...books, ...globalBooks];
  }

  const uniqueBooks = dedupeByIsbn(books);
  uniqueBooks.sort((a, b) => {
    const aPt = a.language?.toLowerCase().startsWith("pt") ? 0 : 1;
    const bPt = b.language?.toLowerCase().startsWith("pt") ? 0 : 1;
    return aPt - bPt;
  });

  return uniqueBooks.slice(0, limit);
}

/** Busca um livro específico pelo ISBN-13. Retorna `null` se a Google não o conhece. */
export async function findGoogleBookByIsbn(
  isbn13: string,
  options: GoogleBooksOptions = {},
): Promise<ExternalBook | null> {
  const items = await fetchVolumes(`isbn:${isbn13}`, 5, options);

  const validBooks = items
    .map(mapGoogleVolume)
    .filter((book): book is ExternalBook => book !== null && book.isbn13 === isbn13);

  if (validBooks.length === 0) {
    return null;
  }

  const uniqueTitles = new Set(validBooks.map((b) => b.title.toLowerCase().trim()));
  if (uniqueTitles.size > 1) {
    return null;
  }

  const [firstMatch] = validBooks;
  return firstMatch ?? null;
}
