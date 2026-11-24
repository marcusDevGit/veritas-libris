import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { BookDto } from '@app/shared';
import { BookCard } from './BookCard.js';

const sampleBook: BookDto = {
  _id: 'book-1',
  isbn13: '9788535902778',
  title: 'Confissões',
  authors: ['Santo Agostinho'],
  language: 'pt-BR',
  hasImprimatur: true,
  editorialLock: false,
  adequacyStatus: 'RECOMMENDED',
  recommendedAge: '14+',
  tags: ['patristica', 'teologia'],
  reservations: [],
  alternatives: [],
  communityStats: {
    totalReviews: 3,
    recommendedCount: 3,
    reservationsCount: 0,
    notRecommendedCount: 0,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BookCard', () => {
  it('renderiza tags clicáveis apontando para o filtro do catálogo (?tags=...)', () => {
    render(
      <MemoryRouter>
        <BookCard book={sampleBook} />
      </MemoryRouter>
    );

    const patristicaLink = screen.getByRole('link', { name: 'Patristica' });
    const teologiaLink = screen.getByRole('link', { name: 'Teologia' });

    expect(patristicaLink).toHaveAttribute('href', '/?tags=patristica');
    expect(teologiaLink).toHaveAttribute('href', '/?tags=teologia');
  });
});
