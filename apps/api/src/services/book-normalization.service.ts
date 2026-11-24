import { formatBookTitle } from '@app/shared';
import { BookModel } from '../models/Book.model.js';
import { fetchBrasilApiByIsbn } from './external-books-providers.service.js';

export interface NormalizeLegacyBooksOptions {
  dryRun?: boolean;
  refreshSynopsis?: boolean;
  fetchExternalByIsbn?: (isbn13: string) => Promise<{ synopsis?: string } | null>;
}

export interface NormalizedBookItem {
  id: string;
  isbn13: string;
  oldTitle: string;
  newTitle: string;
  synopsisUpdated: boolean;
}

export interface NormalizeLegacyBooksResult {
  scanned: number;
  updated: number;
  skipped: number;
  items: NormalizedBookItem[];
}

/**
 * Normaliza títulos em caixa alta/sem padrão (formatBookTitle) e, opcionalmente,
 * reimporta sinopses antigas sem quebras de linha preservando todos os campos de curadoria.
 */
export async function normalizeLegacyBooks(
  options: NormalizeLegacyBooksOptions = {},
): Promise<NormalizeLegacyBooksResult> {
  const dryRun = options.dryRun === true;
  const refreshSynopsis = options.refreshSynopsis === true;
  const fetchByIsbn = options.fetchExternalByIsbn ?? fetchBrasilApiByIsbn;

  const books = await BookModel.find({})
    .select('_id isbn13 title subtitle synopsis')
    .lean<Array<{ _id: unknown; isbn13: string; title: string; subtitle?: string; synopsis?: string }>>();

  let updated = 0;
  let skipped = 0;
  const items: NormalizedBookItem[] = [];

  for (const book of books) {
    const patch: Record<string, string> = {};
    const nextTitle = formatBookTitle(book.title);
    if (nextTitle && nextTitle !== book.title) {
      patch.title = nextTitle;
    }

    if (book.subtitle) {
      const nextSubtitle = formatBookTitle(book.subtitle);
      if (nextSubtitle && nextSubtitle !== book.subtitle) {
        patch.subtitle = nextSubtitle;
      }
    }

    let synopsisUpdated = false;
    if (refreshSynopsis && book.isbn13 && (!book.synopsis || !book.synopsis.includes('\n'))) {
      const external = await fetchByIsbn(book.isbn13).catch(() => null);
      const nextSynopsis = external?.synopsis?.trim();
      if (nextSynopsis && nextSynopsis !== book.synopsis) {
        patch.synopsis = nextSynopsis;
        synopsisUpdated = true;
      }
    }

    if (Object.keys(patch).length === 0) {
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      await BookModel.updateOne({ _id: book._id }, { $set: patch });
    }

    updated += 1;
    items.push({
      id: String(book._id),
      isbn13: book.isbn13,
      oldTitle: book.title,
      newTitle: patch.title ?? book.title,
      synopsisUpdated,
    });
  }

  return {
    scanned: books.length,
    updated,
    skipped,
    items,
  };
}
