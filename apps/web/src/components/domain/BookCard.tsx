import React from 'react';
import { Link } from 'react-router-dom';
import { formatBookTitle, RESERVATION_TOPIC_LABELS, type BookDto } from '@app/shared';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';

export interface BookCardProps {
  book: BookDto;
  reviewCount?: number;
  viewMode?: 'grid' | 'list';
}

/**
 * BookCard — Card Editorial do Catálogo Veritas Libris
 * 
 * Fidelidade total ao Stitch:
 * - Mockup ou capa real com badges flutuantes (Idade, Clássico, Imprimatur, Alerta)
 * - Status Pill com ícone e veredito em caixa alta
 * - Caixa contextual de "Atenção Formativa" ou "Risco Doutrinário" para livros com ressalvas
 * - Tags temáticas e rodapé com número de pareceres e link direto
 */
export const BookCard: React.FC<BookCardProps> = ({
  book,
  reviewCount = 0,
  viewMode = 'grid',
}) => {
  const displayTitle = formatBookTitle(book.title);
  const isList = viewMode === 'list';
  const hasHighSeverity = book.reservations.some((r) => r.severity === 'HIGH');
  const mainReservation = book.reservations[0];

  const getStatusBadge = () => {
    switch (book.adequacyStatus) {
      case 'RECOMMENDED':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container text-secondary text-[11px] font-bold tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
            <span>RECOMENDADO</span>
          </div>
        );
      case 'WITH_RESERVATIONS':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-secondary-container/40 text-on-secondary-fixed-variant text-[11px] font-bold tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5 text-secondary" />
            <span>COM RESSALVAS</span>
          </div>
        );
      case 'NOT_RECOMMENDED':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-error-container text-on-error-container text-[11px] font-bold tracking-wide">
            <XCircle className="w-3.5 h-3.5 text-error" />
            <span>DESACONSELHADO</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container text-outline text-[11px] font-bold tracking-wide">
            <HelpCircle className="w-3.5 h-3.5 text-outline" />
            <span>SEM AVALIAÇÃO</span>
          </div>
        );
    }
  };

  const getTopLeftBadge = () => {
    if (book.hasImprimatur) {
      return (
        <span className="px-2 py-0.5 bg-secondary text-on-secondary text-[10px] font-bold rounded flex items-center gap-1 shadow-xs tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>IMPRIMATUR</span>
        </span>
      );
    }
    if (book.adequacyStatus === 'NOT_RECOMMENDED' || hasHighSeverity) {
      return (
        <span className="px-2 py-0.5 bg-error text-on-error text-[10px] font-bold rounded flex items-center gap-1 shadow-xs">
          <ShieldAlert className="w-3 h-3" />
          <span>Alerta Severo</span>
        </span>
      );
    }
    if (book.recommendedAge === 'ALL') {
      return (
        <span className="px-2 py-0.5 bg-surface-container-lowest/95 backdrop-blur-xs text-secondary text-[10px] font-semibold rounded flex items-center gap-1 shadow-xs border border-outline/10">
          <Users className="w-3 h-3" />
          <span>Leitura Familiar</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-surface-container-lowest/90 backdrop-blur-xs text-secondary text-[10px] font-semibold rounded flex items-center gap-1 shadow-xs border border-outline/10">
        <Sparkles className="w-3 h-3" />
        <span>Clássico Católico</span>
      </span>
    );
  };

  return (
    <article
      className={`flex bg-surface-container-lowest rounded-xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden group border border-outline/10 ${
        isList ? 'flex-row items-stretch' : 'flex-col'
      }`}
    >
      <Link
        to={`/livros/${book._id}`}
        className={`relative bg-gradient-to-b from-surface-container to-surface-container-high flex items-center justify-center overflow-hidden ${
          isList ? 'w-28 sm:w-36 shrink-0 p-3' : 'h-64 w-full p-6'
        }`}
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Capa de ${displayTitle}`}
            className={`object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-300 ${
              isList ? 'w-20 h-28 sm:w-24 sm:h-36' : 'w-36 h-52'
            }`}
            loading="lazy"
          />
        ) : (
          <div
            className={`bg-primary rounded shadow-md flex flex-col justify-between relative group-hover:scale-105 transition-transform duration-300 text-center ${
              isList ? 'w-20 h-28 sm:w-24 sm:h-36 p-2' : 'w-36 h-52 p-3'
            }`}
          >
            <div className="border border-secondary-container/40 h-full w-full p-2 flex flex-col justify-between">
              <span className="text-[9px] uppercase tracking-widest text-secondary-container font-medium line-clamp-1">
                {book.authors[0] || 'Autor'}
              </span>
              <div className="flex flex-col items-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-container mb-1 stroke-[1.5]" />
                <span className="text-[10px] sm:text-[11px] font-editorial text-surface font-bold leading-tight line-clamp-3">
                  {displayTitle}
                </span>
              </div>
              <span className="text-[8px] uppercase tracking-wider text-surface-variant">
                Veritas Libris
              </span>
            </div>
          </div>
        )}

        <span
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded shadow-xs ${
            book.recommendedAge === 'ALL'
              ? 'bg-secondary text-on-secondary'
              : 'bg-tertiary text-on-tertiary'
          }`}
        >
          {book.recommendedAge}
        </span>

        {!isList && (
          <div className="absolute top-3 left-3">
            {getTopLeftBadge()}
          </div>
        )}
      </Link>

      <div className={`flex flex-col flex-1 justify-between gap-3 min-w-0 ${isList ? 'p-3.5 sm:p-5' : 'p-5'}`}>
        <div className="flex flex-col gap-1.5">
          <div className="w-fit">
            {getStatusBadge()}
          </div>

          <Link to={`/livros/${book._id}`}>
            <h2 className="font-editorial text-base font-bold text-primary group-hover:text-primary-container transition-colors line-clamp-1 mt-1">
              {displayTitle}
            </h2>
          </Link>
          <p className="text-xs text-on-surface-variant line-clamp-1">
            {book.authors.join(', ')}
          </p>

          {book.adequacyStatus === 'NOT_RECOMMENDED' && mainReservation ? (
            <div className="p-2.5 bg-error-container/30 border border-error/20 rounded-lg text-xs text-on-error-container mt-1 leading-snug">
              <strong>Risco Doutrinário:</strong>{' '}
              <span className="line-clamp-2">
                {mainReservation.description || RESERVATION_TOPIC_LABELS[mainReservation.topic] || 'Contém graves desvios da moral ou da fé.'}
              </span>
            </div>
          ) : book.adequacyStatus === 'WITH_RESERVATIONS' && mainReservation ? (
            <div className="p-2.5 bg-secondary-container/20 border border-secondary-container/30 rounded-lg text-xs text-on-secondary-fixed-variant mt-1 leading-snug">
              <strong>Atenção Formativa:</strong>{' '}
              <span className="line-clamp-2">
                {mainReservation.description || RESERVATION_TOPIC_LABELS[mainReservation.topic] || 'Exige maturidade espiritual e discernimento leitor.'}
              </span>
            </div>
          ) : book.synopsis ? (
            <p className="text-xs text-outline line-clamp-2 mt-1 leading-relaxed">
              {book.synopsis}
            </p>
          ) : (
            <p className="text-xs text-outline italic line-clamp-2 mt-1">
              Obra catalogada para discernimento pastoral e formação de leitores cristãos.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5 pt-2 border-t border-outline/10">
          <div className="flex flex-wrap gap-1">
            {book.tags.length > 0 ? (
              book.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  to={`/?tags=${encodeURIComponent(tag)}`}
                  className="px-2 py-0.5 bg-surface-container hover:bg-secondary-container/40 text-on-surface-variant hover:text-primary rounded text-[10px] font-medium transition-colors"
                >
                  {formatBookTitle(tag)}
                </Link>
              ))
            ) : book.reservations.length > 0 ? (
              book.reservations.slice(0, 2).map((r, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-medium"
                >
                  {RESERVATION_TOPIC_LABELS[r.topic] || r.topic}
                </span>
              ))
            ) : (
              <>
                <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-medium">
                  Tradição Cristã
                </span>
                <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-medium">
                  Virtudes Morais
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-outline">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-secondary" />
              <span>
                {reviewCount > 0 ? `${reviewCount} pareceres` : `${book.reservations.length} ressalvas`}
              </span>
            </span>

            <Link
              to={`/livros/${book._id}`}
              className="text-primary font-bold hover:text-secondary flex items-center gap-0.5 text-xs transition-colors"
            >
              <span>Ver Ficha</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
