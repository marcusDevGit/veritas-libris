import React from 'react';
import type { BookDto } from '@app/shared';
import { BookOpen } from 'lucide-react';

interface CurationBookSummaryHeaderProps {
  book: BookDto;
}

export const CurationBookSummaryHeader: React.FC<CurationBookSummaryHeaderProps> = ({ book }) => {
  const totalReviews = book.communityStats.totalReviews;
  const pct = (count: number) =>
    totalReviews === 0 ? 0 : Math.round((count / totalReviews) * 100);

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 pb-5 border-b border-outline/15">
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-16 h-24 object-cover rounded-lg border border-outline/20 shadow-2xs shrink-0"
        />
      ) : (
        <div className="w-16 h-24 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="font-editorial text-xl font-bold text-primary leading-snug">
          {book.title}
        </h2>
        <p className="text-sm text-on-surface-variant mt-0.5">
          {book.authors.join(', ')}
          {book.publishedYear ? ` (${book.publishedYear})` : ''} • ISBN {book.isbn13}
        </p>

        <div className="mt-3 p-3 rounded-lg bg-surface-container-low border border-outline/15 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-primary">
              Consenso Comunitário ({totalReviews} avaliações)
            </span>
            {book.editorialLockedBy && (
              <span className="text-[11px] text-secondary font-semibold">
                Última trava por {book.editorialLockedBy}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-on-surface-variant">
            <span>
              <strong className="text-emerald-700">
                {pct(book.communityStats.recommendedCount)}%
              </strong>{' '}
              Recomendado
            </span>
            <span>
              <strong className="text-amber-700">
                {pct(book.communityStats.reservationsCount)}%
              </strong>{' '}
              Com Ressalvas
            </span>
            <span>
              <strong className="text-error">
                {pct(book.communityStats.notRecommendedCount)}%
              </strong>{' '}
              Não Recomendado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
