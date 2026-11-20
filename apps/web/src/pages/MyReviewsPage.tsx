import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, ExternalLink, Home, MessageSquareText, ThumbsUp, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { AdequacyBadge } from '../components/domain/AdequacyBadge.js';

export const MyReviewsPage: React.FC = () => {
  const { user, isLoading: authLoading, signInWithGoogle } = useAuth();
  const queryClient = useQueryClient();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  usePageMeta(
    'Meus Pareceres',
    'Acompanhe as obras avaliadas por você e gerencie seus pareceres publicados no Veritas Libris.',
  );

  const myReviewsQuery = useQuery({
    queryKey: ['my-reviews', user?.uid],
    queryFn: () => api.listMyReviews(),
    enabled: Boolean(user),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => api.deleteReview(reviewId),
    onSuccess: async (res) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['book', res.bookId] }),
        queryClient.invalidateQueries({ queryKey: ['book-reviews', res.bookId] }),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
      ]);
    },
  });

  if (authLoading) {
    return (
      <div className="pt-[108px] pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-48 rounded-2xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-[108px] pb-16 max-w-xl mx-auto px-4 text-center">
        <div className="bg-surface-container-lowest border border-outline/20 rounded-2xl p-8 shadow-xs">
          <MessageSquareText className="w-10 h-10 text-secondary mx-auto mb-3" />
          <h1 className="font-editorial text-2xl font-bold text-primary mb-2">Meus Pareceres</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Entre com sua conta Google para consultar e gerenciar suas avaliações publicadas.
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  const items = myReviewsQuery.data?.items ?? [];

  return (
    <div className="pt-[96px] sm:pt-[116px] pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Meus Pareceres</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Meus Pareceres
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Histórico das obras analisadas por você ({myReviewsQuery.data?.total ?? 0} registradas).
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors self-start"
          >
            <BookOpen className="w-4 h-4" />
            Explorar Catálogo
          </Link>
        </div>
      </header>

      {myReviewsQuery.isLoading ? (
        <div className="space-y-4">
          <div className="h-32 rounded-xl bg-surface-container animate-pulse" />
          <div className="h-32 rounded-xl bg-surface-container animate-pulse" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-10 text-center space-y-3">
          <MessageSquareText className="w-9 h-9 text-outline mx-auto" />
          <h2 className="font-editorial text-lg font-bold text-primary">
            Você ainda não publicou nenhum parecer
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
            Abra qualquer obra do catálogo para registrar sua análise moral, faixa etária e ressalvas pedagógicas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <article
              key={item._id}
              className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 shadow-xs flex flex-col gap-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-editorial text-lg font-bold text-primary">
                    {item.book ? (
                      <Link to={`/livros/${item.book._id}`} className="hover:underline inline-flex items-center gap-1.5">
                        <span>{item.book.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-outline" />
                      </Link>
                    ) : (
                      'Obra removida'
                    )}
                  </h2>
                  {item.book && item.book.authors.length > 0 && (
                    <p className="text-xs text-on-surface-variant">{item.book.authors.join(', ')}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <AdequacyBadge status={item.adequacyVote} size="sm" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container text-primary">
                    {item.ageVote}
                  </span>
                </div>
              </div>

              <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low/60 border border-outline/10 rounded-lg p-3.5">
                {item.comment}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline/10 text-xs text-outline">
                <div className="flex items-center gap-4">
                  <span>
                    Atualizado em{' '}
                    {new Date(item.updatedAt ?? item.createdAt ?? Date.now()).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {item.helpfulVotes} úteis
                  </span>
                </div>

                {confirmDeleteId === item._id ? (
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-error-container/50 border border-error/30">
                    <span className="font-semibold text-error">Excluir parecer?</span>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        setConfirmDeleteId(null);
                        deleteMutation.mutate(item._id);
                      }}
                      className="px-2 py-0.5 rounded bg-error text-on-error font-bold cursor-pointer"
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-0.5 rounded bg-surface text-on-surface font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(item._id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-error-container/40 text-error font-semibold border border-error/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
