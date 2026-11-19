import { z } from 'zod';
import type { ExternalBook } from '@app/shared';

const BRASIL_API_ISBN_URL = 'https://brasilapi.com.br/api/isbn/v1';
const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/api/books';
const PROVIDER_TIMEOUT_MS = 5_000;

const BrasilApiResponseSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().nullable().optional(),
  authors: z.array(z.string()).optional(),
  publisher: z.string().nullable().optional(),
  synopsis: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  page_count: z.number().int().nullable().optional(),
  cover_url: z.string().nullable().optional(),
});

const OpenLibraryBookSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  authors: z.array(z.object({ name: z.string() })).optional(),
  publishers: z.array(z.object({ name: z.string() })).optional(),
  number_of_pages: z.number().int().optional(),
  publish_date: z.string().optional(),
  cover: z
    .object({
      large: z.string().optional(),
      medium: z.string().optional(),
      small: z.string().optional(),
    })
    .optional(),
});

export function mapBrasilApiVolume(
  raw: unknown,
  isbn13: string,
): Partial<ExternalBook> | null {
  const parsed = BrasilApiResponseSchema.safeParse(raw);
  if (!parsed.success) return null;

  const data = parsed.data;
  const title = data.title?.trim() || undefined;
  const subtitle = data.subtitle?.trim() || undefined;
  const authors = (data.authors ?? []).map((a) => a.trim()).filter(Boolean);
  const publisher = data.publisher?.trim() || undefined;
  const synopsis = data.synopsis?.trim() || undefined;
  const pageCount =
    typeof data.page_count === 'number' && data.page_count > 0
      ? data.page_count
      : undefined;
  const publishedYear =
    typeof data.year === 'number' && data.year >= 1 && data.year <= new Date().getFullYear() + 1
      ? data.year
      : undefined;
  const coverUrl =
    data.cover_url && data.cover_url.startsWith('https://')
      ? data.cover_url
      : undefined;

  return {
    isbn13,
    ...(title ? { title } : {}),
    ...(subtitle ? { subtitle } : {}),
    ...(authors.length > 0 ? { authors } : {}),
    ...(publisher ? { publisher } : {}),
    ...(synopsis ? { synopsis } : {}),
    ...(pageCount ? { pageCount } : {}),
    ...(publishedYear ? { publishedYear } : {}),
    ...(coverUrl ? { coverUrl } : {}),
    language: 'pt-BR',
  };
}

export function mapOpenLibraryVolume(
  raw: unknown,
  isbn13: string,
): Partial<ExternalBook> | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const entry = (raw as Record<string, unknown>)[`ISBN:${isbn13}`];
  const parsed = OpenLibraryBookSchema.safeParse(entry);
  if (!parsed.success) return null;

  const data = parsed.data;
  const title = data.title?.trim() || undefined;
  const subtitle = data.subtitle?.trim() || undefined;
  const authors = (data.authors ?? []).map((a) => a.name.trim()).filter(Boolean);
  const publisher = data.publishers?.[0]?.name.trim() || undefined;
  const pageCount =
    typeof data.number_of_pages === 'number' && data.number_of_pages > 0
      ? data.number_of_pages
      : undefined;

  let publishedYear: number | undefined;
  if (data.publish_date) {
    const match = data.publish_date.match(/\b(\d{4})\b/);
    if (match) {
      const year = Number(match[1]);
      if (year >= 1 && year <= new Date().getFullYear() + 1) {
        publishedYear = year;
      }
    }
  }

  const rawCover = data.cover?.large ?? data.cover?.medium ?? data.cover?.small;
  const coverUrl = rawCover && rawCover.startsWith('https://') ? rawCover : undefined;

  return {
    isbn13,
    ...(title ? { title } : {}),
    ...(subtitle ? { subtitle } : {}),
    ...(authors.length > 0 ? { authors } : {}),
    ...(publisher ? { publisher } : {}),
    ...(pageCount ? { pageCount } : {}),
    ...(publishedYear ? { publishedYear } : {}),
    ...(coverUrl ? { coverUrl } : {}),
  };
}

export function mergeBookMetadata(
  primary: Partial<ExternalBook> | null,
  secondary: Partial<ExternalBook> | null,
): Partial<ExternalBook> | null {
  if (!primary && !secondary) return null;
  if (!primary) return secondary;
  if (!secondary) return primary;

  const isPrimaryPortuguese = primary.language?.toLowerCase().startsWith('pt') ?? false;
  const isSecondaryPortuguese = secondary.language?.toLowerCase().startsWith('pt') ?? false;

  const synopsis =
    !isPrimaryPortuguese && isSecondaryPortuguese && secondary.synopsis
      ? secondary.synopsis
      : primary.synopsis || secondary.synopsis;

  const language =
    !isPrimaryPortuguese && isSecondaryPortuguese && secondary.synopsis
      ? secondary.language
      : primary.language || secondary.language;

  return {
    ...secondary,
    ...primary,
    authors:
      primary.authors && primary.authors.length > 0
        ? primary.authors
        : secondary.authors,
    publisher: primary.publisher || secondary.publisher,
    pageCount: primary.pageCount || secondary.pageCount,
    publishedYear: primary.publishedYear || secondary.publishedYear,
    coverUrl: primary.coverUrl || secondary.coverUrl,
    synopsis,
    language,
  };
}

async function fetchJsonWithTimeout(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchBrasilApiByIsbn(
  isbn13: string,
): Promise<Partial<ExternalBook> | null> {
  const data = await fetchJsonWithTimeout(`${BRASIL_API_ISBN_URL}/${isbn13}`);
  return data ? mapBrasilApiVolume(data, isbn13) : null;
}

export async function fetchOpenLibraryByIsbn(
  isbn13: string,
): Promise<Partial<ExternalBook> | null> {
  const params = new URLSearchParams({
    bibkeys: `ISBN:${isbn13}`,
    format: 'json',
    jscmd: 'data',
  });
  const data = await fetchJsonWithTimeout(`${OPEN_LIBRARY_API_URL}?${params.toString()}`);
  return data ? mapOpenLibraryVolume(data, isbn13) : null;
}

export async function enrichWithFallbackProviders(
  isbn13: string,
  primary: ExternalBook | null,
): Promise<ExternalBook | null> {
  const needsEnrichment =
    !primary ||
    !primary.publisher ||
    !primary.pageCount ||
    !primary.synopsis ||
    !(primary.language?.toLowerCase().startsWith('pt') ?? false);

  if (!needsEnrichment) return primary;

  const [brasilData, openLibraryData] = await Promise.all([
    fetchBrasilApiByIsbn(isbn13),
    fetchOpenLibraryByIsbn(isbn13),
  ]);

  let merged = mergeBookMetadata(primary, brasilData);
  merged = mergeBookMetadata(merged, openLibraryData);

  if (!merged?.title || !merged.isbn13) return primary;

  return {
    isbn13: merged.isbn13,
    title: merged.title,
    authors:
      merged.authors && merged.authors.length > 0
        ? merged.authors
        : ['Autor não informado'],
    ...(merged.googleBooksId ? { googleBooksId: merged.googleBooksId } : {}),
    ...(merged.subtitle ? { subtitle: merged.subtitle } : {}),
    ...(merged.coverUrl ? { coverUrl: merged.coverUrl } : {}),
    ...(merged.synopsis ? { synopsis: merged.synopsis } : {}),
    ...(merged.publishedYear ? { publishedYear: merged.publishedYear } : {}),
    ...(merged.publisher ? { publisher: merged.publisher } : {}),
    ...(merged.pageCount ? { pageCount: merged.pageCount } : {}),
    ...(merged.language ? { language: merged.language } : {}),
  };
}
