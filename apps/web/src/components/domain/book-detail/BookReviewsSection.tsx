import React, { useState, useMemo } from 'react';
import type { Review } from '@app/shared';
import { AdequacyBadge } from '../AdequacyBadge.js';
import { ThumbsUp, ShieldCheck, MessageSquare, Pencil, Trash2, ShieldAlert } from 'lucide-react';

export interface BookReviewsSectionProps {
  reviews: Review[];
  totalReviews: number;
  isLoading: boolean;
  currentUserId?: string;
  canModerate?: boolean;
  deletingReviewId?: string | null;
  onVoteHelpful: (reviewId: string) => void;
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (reviewId: string) => void;
}

type ReviewFilterTab = 'ALL' | 'CURATORS' | 'READERS';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * BookReviewsSection — Mural de Pareceres & Avaliações da Comunidade
 *
 * Reproduz a seção de avaliações do Stitch:
 * - Abas interativas de filtro por perfil (Todos, Curadores Oficiais, Leitores)
 * - Cards com avatar por iniciais, badge de curadoria, voto moral e botão de utilidade
 */
export const BookReviewsSection: React.FC<BookReviewsSectionProps> = ({
  reviews,
  totalReviews,
  isLoading,
  currentUserId,
  canModerate = false,
  deletingReviewId = null,
  onVoteHelpful,
  onEditReview,
  onDeleteReview,
}) => {
  const [activeTab, setActiveTab] = useState<ReviewFilterTab>('ALL');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const curatorCount = useMemo(
    () => reviews.filter((r) => r.isCurator).length,
    [reviews]
  );
  const readerCount = useMemo(
    () => reviews.filter((r) => !r.isCurator).length,
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    if (activeTab === 'CURATORS') return reviews.filter((r) => r.isCurator);
    if (activeTab === 'READERS') return reviews.filter((r) => !r.isCurator);
    return reviews;
  }, [reviews, activeTab]);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-sm border border-outline/10 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
            Opinião Balizada
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary mt-0.5">
            Pareceres & Avaliações da Comunidade
          </h2>
        </div>

        <span className="text-xs font-semibold text-outline flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-secondary" />
          <span>{totalReviews} pareceres registrados</span>
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-outline/10 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-primary text-on-primary'
              : 'hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          Todos ({totalReviews})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CURATORS')}
          className={`px-4 py-2 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'CURATORS'
              ? 'bg-primary text-on-primary'
              : 'hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          Curadores Oficiais ({curatorCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('READERS')}
          className={`px-4 py-2 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
            activeTab === 'READERS'
              ? 'bg-primary text-on-primary'
              : 'hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          Leitores & Famílias ({readerCount})
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-8 text-center bg-surface-container-low rounded-xl border border-outline/10 text-outline text-xs sm:text-sm">
          {activeTab === 'ALL'
            ? 'Esta obra ainda não possui pareceres publicados. Seja o primeiro a compartilhar seu discernimento.'
            : 'Nenhum parecer encontrado para esta categoria de perfil.'}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredReviews.map((rev) => (
            <article
              key={rev._id}
              className="p-5 sm:p-6 rounded-xl bg-surface-container-low border border-outline/10 flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      rev.isCurator
                        ? 'bg-primary text-on-primary ring-2 ring-secondary'
                        : 'bg-surface-container-highest text-primary'
                    }`}
                  >
                    {getInitials(rev.userName)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-primary">{rev.userName}</h4>
                      {rev.isCurator && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary-container text-on-primary font-semibold">
                          Curador Oficial
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-outline">
                      Publicado em {new Date(rev.createdAt || Date.now()).toLocaleDateString('pt-BR')} • Faixa sugerida: {rev.ageVote}
                    </span>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <AdequacyBadge status={rev.adequacyVote} size="sm" />
                </div>
              </div>

              <p className="text-sm text-on-surface leading-relaxed">
                {rev.comment}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-outline/10">
                <div className="flex flex-wrap items-center gap-2 text-xs text-outline">
                  {rev.isCurator && (
                    <span className="flex items-center gap-1 text-secondary font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Parecer com Validação Metodológica</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {rev._id && currentUserId && rev.userId === currentUserId && onEditReview && (
                    <button
                      type="button"
                      onClick={() => onEditReview(rev)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors border border-outline/15 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}

                  {rev._id &&
                    onDeleteReview &&
                    ((currentUserId && rev.userId === currentUserId) || canModerate) &&
                    (confirmingDeleteId === rev._id ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-error-container/50 border border-error/30 text-xs">
                        <span className="font-semibold text-error">Confirmar remoção?</span>
                        <button
                          type="button"
                          disabled={deletingReviewId === rev._id}
                          onClick={() => {
                            setConfirmingDeleteId(null);
                            if (rev._id) onDeleteReview(rev._id);
                          }}
                          className="px-2 py-0.5 rounded bg-error text-on-error font-bold cursor-pointer disabled:opacity-50"
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-2 py-0.5 rounded bg-surface text-on-surface font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={deletingReviewId === rev._id}
                        onClick={() => rev._id && setConfirmingDeleteId(rev._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-error-container/40 text-error text-xs font-semibold transition-colors border border-error/20 cursor-pointer disabled:opacity-50"
                      >
                        {currentUserId && rev.userId === currentUserId ? (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Moderar</span>
                          </>
                        )}
                      </button>
                    ))}

                  <button
                    type="button"
                    onClick={() => rev._id && onVoteHelpful(rev._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors border border-outline/15 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Útil ({rev.helpfulVotes})</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
