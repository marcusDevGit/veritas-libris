import React from 'react';
import { Link } from 'react-router-dom';
import type { AdequacyLevel, BookDto } from '@app/shared';
import { Award, BookOpen, Trash2, ArrowRight } from 'lucide-react';

interface ReadingListCardProps {
  book: BookDto;
  addedAt: string;
  isRemoving: boolean;
  onRemove: (bookId: string) => void;
}

const VERDICT_BADGE: Record<AdequacyLevel, { label: string; className: string }> = {
  RECOMMENDED: {
    label: 'Recomendado',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  WITH_RESERVATIONS: {
    label: 'Com Ressalvas',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  NOT_RECOMMENDED: {
    label: 'Não Recomendado',
    className: 'bg-rose-50 text-error border-rose-200',
  },
  UNRATED: {
    label: 'Sem Parecer',
    className: 'bg-surface-container text-on-surface-variant border-outline/20',
  },
};

export const ReadingListCard: React.FC<ReadingListCardProps> = ({
  book,
  addedAt,
  isRemoving,
  onRemove,
}) => {
  const verdict = VERDICT_BADGE[book.adequacyStatus];

  return (
    <article className="bg-surface-container-lowest border border-outline/15 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <Link to={`/livros/${book._id}`} className="shrink-0">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-16 h-24 object-cover rounded-lg border border-outline/15 shadow-2xs"
            />
          ) : (
            <div className="w-16 h-24 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <BookOpen className="w-6 h-6" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${verdict.className}`}
            >
              {verdict.label}
            </span>
            <span className="px-2 py-0.5 rounded bg-tertiary text-on-tertiary text-[10px] font-bold">
              {book.recommendedAge === 'ALL' ? 'Livre' : book.recommendedAge}
            </span>
            {book.hasImprimatur && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container/60 text-on-secondary-container text-[10px] font-bold">
                <Award className="w-3 h-3 text-secondary" />
                Imprimatur
              </span>
            )}
          </div>

          <Link to={`/livros/${book._id}`}>
            <h2 className="font-editorial text-base font-bold text-primary hover:text-primary-container transition-colors line-clamp-2 leading-snug">
              {book.title}
            </h2>
          </Link>
          <p className="text-xs text-on-surface-variant mt-1 truncate">
            {book.authors.join(', ')}
            {book.publishedYear ? ` • ${book.publishedYear}` : ''}
          </p>
          <p className="text-[11px] text-outline mt-0.5 font-mono">ISBN {book.isbn13}</p>
        </div>
      </div>

      {book.editorialSummary && (
        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed bg-surface-container-low rounded-lg p-2.5 border border-outline/10">
          {book.editorialSummary}
        </p>
      )}

      <div className="pt-3 border-t border-outline/10 flex items-center justify-between gap-2">
        <span className="text-[11px] text-on-surface-variant">
          Salvo em {new Date(addedAt).toLocaleDateString('pt-BR')}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRemoving}
            onClick={() => onRemove(book._id)}
            title="Remover da lista de leitura"
            className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-error hover:bg-error-container/25 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remover</span>
          </button>

          <Link
            to={`/livros/${book._id}`}
            className="inline-flex items-center gap-1 h-9 px-3.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-colors"
          >
            <span>Ver Ficha</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
