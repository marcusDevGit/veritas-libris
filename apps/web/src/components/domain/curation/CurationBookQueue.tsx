import React from 'react';
import type { AdequacyLevel, BookDto, CurationFilter, CurationStats } from '@app/shared';
import { Lock, Search, Award } from 'lucide-react';

interface CurationBookQueueProps {
  books: BookDto[];
  stats: CurationStats;
  selectedBookId: string | null;
  searchTerm: string;
  filter: CurationFilter;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: CurationFilter) => void;
  onSelectBook: (book: BookDto) => void;
}

const STATUS_CHIP: Record<AdequacyLevel, { label: string; className: string }> = {
  RECOMMENDED: { label: 'Recomendado', className: 'bg-emerald-50 text-emerald-800' },
  WITH_RESERVATIONS: { label: 'Ressalvas', className: 'bg-amber-50 text-amber-800' },
  NOT_RECOMMENDED: { label: 'Não Recomendado', className: 'bg-rose-50 text-error' },
  UNRATED: { label: 'Sem Parecer', className: 'bg-surface-container text-on-surface-variant' },
};

export const CurationBookQueue: React.FC<CurationBookQueueProps> = ({
  books,
  stats,
  selectedBookId,
  searchTerm,
  filter,
  isLoading,
  onSearchChange,
  onFilterChange,
  onSelectBook,
}) => {
  const pills: Array<{ value: CurationFilter; label: string; count: number }> = [
    { value: 'all', label: 'Todas', count: stats.total },
    { value: 'unlocked', label: 'Sem Trava', count: stats.pendingReview },
    { value: 'locked', label: 'Travadas', count: stats.locked },
    { value: 'imprimatur', label: 'Imprimatur', count: stats.imprimatur },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline/15 rounded-xl shadow-2xs p-4 flex flex-col gap-3">
      <div className="relative w-full">
        <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por título, autor ou ISBN-13..."
          className="w-full h-10 pl-9 pr-3 bg-surface-container-low text-on-surface placeholder:text-outline text-xs sm:text-sm rounded-lg border border-outline/20 focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs font-semibold">
        {pills.map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => onFilterChange(pill.value)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              filter === pill.value
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:text-primary'
            }`}
          >
            {pill.label} ({pill.count})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-xs text-on-surface-variant">
          Carregando fila de obras...
        </div>
      ) : books.length === 0 ? (
        <div className="py-10 text-center text-xs text-on-surface-variant">
          Nenhuma obra encontrada para este filtro.
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[640px] overflow-y-auto pr-0.5">
          {books.map((book) => {
            const isSelected = book._id === selectedBookId;
            const status = STATUS_CHIP[book.adequacyStatus];

            return (
              <button
                key={book._id}
                type="button"
                onClick={() => onSelectBook(book)}
                className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer flex flex-col gap-2 border ${
                  isSelected
                    ? 'bg-surface-container-low border-primary shadow-2xs'
                    : 'bg-surface-container-lowest border-outline/10 hover:bg-surface-container-low/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-9 h-12 object-cover rounded border border-outline/15 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-12 rounded bg-surface-container flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        VL
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {book.editorialLock && (
                          <Lock className="w-3.5 h-3.5 text-secondary shrink-0" />
                        )}
                        <h3 className="font-editorial text-sm font-bold text-primary truncate">
                          {book.title}
                        </h3>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">
                        {book.authors.join(', ')}
                        {book.publishedYear ? ` • ${book.publishedYear}` : ''}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>ISBN: {book.isbn13}</span>
                  <div className="flex items-center gap-2">
                    {book.hasImprimatur && (
                      <span className="inline-flex items-center gap-0.5 text-secondary font-bold">
                        <Award className="w-3 h-3" />
                        Imprimatur
                      </span>
                    )}
                    <span className="font-semibold text-primary">
                      {book.communityStats.totalReviews} avaliações
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
