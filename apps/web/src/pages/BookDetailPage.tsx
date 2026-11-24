import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.js';
import { BookDetailBreadcrumb } from '../components/domain/book-detail/BookDetailBreadcrumb.js';
import { BookBibliographicSidebar } from '../components/domain/book-detail/BookBibliographicSidebar.js';
import { BookVerdictHeroCard } from '../components/domain/book-detail/BookVerdictHeroCard.js';
import { BookReservationsSection } from '../components/domain/book-detail/BookReservationsSection.js';
import { BookSynopsisAccordion } from '../components/domain/book-detail/BookSynopsisAccordion.js';
import { BookReviewsSection } from '../components/domain/book-detail/BookReviewsSection.js';
import { ReviewModal } from '../components/domain/review-modal/ReviewModal.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Button } from '../components/ui/Button.js';
import { ArrowLeft } from 'lucide-react';

/**
 * BookDetailPage — Página de Detalhes & Veredito Doutrinário
 *
 * Orquestra os componentes modulares em layout assimétrico de 12 colunas:
 * - Breadcrumb + ID Canônico
 * - Coluna Esquerda Sticky (4/12): Capa, ações, especificações bibliográficas e selos
 * - Coluna Direita Editorial (8/12): Veredito Hero, Pontos de Atenção, Sinopse e Pareceres
 */
export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isCurator, signInWithGoogle } = useAuth();
  const queryClient = useQueryClient();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const {
    data: book,
    isLoading: isBookLoading,
    isError: isBookError,
  } = useQuery({
    queryKey: ['book', id],
    queryFn: () => api.getBookById(id!),
    enabled: !!id,
  });

  usePageMeta(
    book ? `${book.title} — ${book.authors[0] ?? 'Obra'}` : undefined,
    book?.synopsis?.slice(0, 155),
  );

  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['book-reviews', id],
    queryFn: () => api.getReviewsByBook(id!, { page: 1, limit: 20 }),
    enabled: !!id,
  });

  const helpfulMutation = useMutation({
    mutationFn: (reviewId: string) => api.voteReviewHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-reviews', id] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => api.deleteReview(reviewId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['book', id] }),
        queryClient.invalidateQueries({ queryKey: ['book-reviews', id] }),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
  });

  const refreshMetadataMutation = useMutation({
    mutationFn: () => api.refreshBookMetadata(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] });
    },
  });

  const readingListStatusQuery = useQuery({
    queryKey: ['reading-list-status', id],
    queryFn: () => api.getReadingListStatus(id!),
    enabled: Boolean(id && user),
  });

  const toggleReadingListMutation = useMutation({
    mutationFn: async (currentlySaved: boolean) =>
      currentlySaved ? api.removeFromReadingList(id!) : api.addToReadingList(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-list-status', id] });
      queryClient.invalidateQueries({ queryKey: ['reading-list'] });
    },
  });

  const handleToggleReadingList = () => {
    if (!user) {
      void signInWithGoogle();
      return;
    }
    toggleReadingListMutation.mutate(Boolean(readingListStatusQuery.data?.saved));
  };

  if (isBookLoading) {
    return (
      <div className="pt-28 sm:pt-[108px] w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse space-y-6">
        <div className="h-6 w-64 bg-surface-container-high rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 h-[520px] bg-surface-container-high rounded-xl" />
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-surface-container-high rounded-xl" />
            <div className="h-48 bg-surface-container-high rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isBookError || !book) {
    return (
      <div className="pt-[108px] px-6 py-20">
        <div className="max-w-md mx-auto p-8 text-center bg-surface-container-lowest border border-outline/20 rounded-2xl space-y-4 shadow-sm">
          <h3 className="font-editorial text-lg font-bold text-error">Obra não encontrada</h3>
          <p className="text-xs text-on-surface-variant">
            O livro solicitado não existe ou foi removido do catálogo.
          </p>
          <Link to="/" className="inline-block">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Catálogo</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-[108px] w-full bg-surface">
      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <BookDetailBreadcrumb
          title={book.title}
          isbn13={book.isbn13}
          publishedYear={book.publishedYear}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <BookBibliographicSidebar
            book={book}
            onOpenReviewModal={() => setIsReviewModalOpen(true)}
            onRefreshMetadata={() => refreshMetadataMutation.mutate()}
            isRefreshingMetadata={refreshMetadataMutation.isPending}
            isSavedInReadingList={Boolean(readingListStatusQuery.data?.saved)}
            isTogglingReadingList={toggleReadingListMutation.isPending}
            onToggleReadingList={handleToggleReadingList}
          />

          <section className="lg:col-span-8 flex flex-col gap-8">
            <BookVerdictHeroCard book={book} />

            <BookReservationsSection reservations={book.reservations} />

            <BookSynopsisAccordion synopsis={book.synopsis} />

            <BookReviewsSection
              reviews={reviewsData?.items ?? []}
              totalReviews={reviewsData?.total ?? 0}
              isLoading={isReviewsLoading}
              currentUserId={user?.uid}
              canModerate={isCurator}
              deletingReviewId={
                deleteReviewMutation.isPending ? deleteReviewMutation.variables ?? null : null
              }
              onVoteHelpful={(reviewId) => helpfulMutation.mutate(reviewId)}
              onEditReview={() => setIsReviewModalOpen(true)}
              onDeleteReview={(reviewId) => deleteReviewMutation.mutate(reviewId)}
            />
          </section>
        </div>
      </div>

      <ReviewModal
        book={book}
        isOpen={isReviewModalOpen}
        initialReview={reviewsData?.items.find((r) => user && r.userId === user.uid) ?? null}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
};
