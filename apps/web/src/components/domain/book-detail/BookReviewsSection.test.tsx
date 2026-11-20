import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Review } from '@app/shared';
import { BookReviewsSection } from './BookReviewsSection.js';

const sampleReviews: Review[] = [
  {
    _id: 'rev-1',
    bookId: 'book-1',
    userId: 'user-author',
    userName: 'Maria Leitora',
    isCurator: false,
    adequacyVote: 'RECOMMENDED',
    ageVote: '12+',
    suggestedTags: ['clássico'],
    reservations: [],
    comment: 'Excelente leitura formativa para jovens e famílias.',
    helpfulVotes: 2,
  },
  {
    _id: 'rev-2',
    bookId: 'book-1',
    userId: 'user-other',
    userName: 'Pedro Comentador',
    isCurator: false,
    adequacyVote: 'WITH_RESERVATIONS',
    ageVote: '14+',
    suggestedTags: [],
    reservations: [],
    comment: 'Comentário de terceiro sujeito a moderação editorial.',
    helpfulVotes: 0,
  },
];

describe('BookReviewsSection', () => {
  it('exibe Editar e Excluir apenas para o próprio autor e confirma antes de remover', () => {
    const onEditReview = vi.fn();
    const onDeleteReview = vi.fn();

    render(
      <BookReviewsSection
        reviews={sampleReviews}
        totalReviews={2}
        isLoading={false}
        currentUserId="user-author"
        canModerate={false}
        onVoteHelpful={vi.fn()}
        onEditReview={onEditReview}
        onDeleteReview={onDeleteReview}
      />,
    );

    const editButtons = screen.getAllByRole('button', { name: /Editar/i });
    expect(editButtons).toHaveLength(1);
    fireEvent.click(editButtons[0]!);
    expect(onEditReview).toHaveBeenCalledWith(sampleReviews[0]);

    expect(screen.queryByRole('button', { name: /Moderar/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));
    expect(screen.getByText(/Confirmar remoção\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sim' }));
    expect(onDeleteReview).toHaveBeenCalledWith('rev-1');
  });

  it('exibe botão Moderar em pareceres de terceiros quando usuário é curador/admin', () => {
    const onDeleteReview = vi.fn();

    render(
      <BookReviewsSection
        reviews={sampleReviews}
        totalReviews={2}
        isLoading={false}
        currentUserId="curator-uid"
        canModerate={true}
        onVoteHelpful={vi.fn()}
        onEditReview={vi.fn()}
        onDeleteReview={onDeleteReview}
      />,
    );

    const moderateButtons = screen.getAllByRole('button', { name: /Moderar/i });
    expect(moderateButtons).toHaveLength(2);
    fireEvent.click(moderateButtons[1]!);
    fireEvent.click(screen.getByRole('button', { name: 'Sim' }));
    expect(onDeleteReview).toHaveBeenCalledWith('rev-2');
  });
});
