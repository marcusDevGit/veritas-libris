import type { BookDto, ReadingListStats } from '@app/shared';

export function computeReadingListStats(books: BookDto[]): ReadingListStats {
  const stats: ReadingListStats = {
    total: books.length,
    recommended: 0,
    withReservations: 0,
    notRecommended: 0,
    imprimatur: 0,
  };

  for (const book of books) {
    if (book.adequacyStatus === 'RECOMMENDED') stats.recommended += 1;
    else if (book.adequacyStatus === 'WITH_RESERVATIONS') stats.withReservations += 1;
    else if (book.adequacyStatus === 'NOT_RECOMMENDED') stats.notRecommended += 1;
    if (book.hasImprimatur) stats.imprimatur += 1;
  }

  return stats;
}
