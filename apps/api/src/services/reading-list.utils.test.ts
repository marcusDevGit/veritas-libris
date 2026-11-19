import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { BookDto } from '@app/shared';
import { computeReadingListStats } from './reading-list.utils.js';

function makeBook(overrides: Partial<BookDto>): BookDto {
  return {
    _id: '507f1f77bcf86cd799439011',
    isbn13: '9788595084742',
    title: 'Livro Teste',
    authors: ['Autor Teste'],
    hasImprimatur: false,
    editorialLock: false,
    adequacyStatus: 'RECOMMENDED',
    recommendedAge: 'ALL',
    tags: [],
    reservations: [],
    alternatives: [],
    communityStats: {
      totalReviews: 0,
      recommendedCount: 0,
      reservationsCount: 0,
      notRecommendedCount: 0,
    },
    ...overrides,
  };
}

describe('reading-list.utils', () => {
  it('computeReadingListStats contabiliza corretamente por veredito e Imprimatur', () => {
    const stats = computeReadingListStats([
      makeBook({ adequacyStatus: 'RECOMMENDED', hasImprimatur: true }),
      makeBook({ adequacyStatus: 'WITH_RESERVATIONS', hasImprimatur: false }),
      makeBook({ adequacyStatus: 'NOT_RECOMMENDED', hasImprimatur: false }),
      makeBook({ adequacyStatus: 'RECOMMENDED', hasImprimatur: false }),
    ]);

    assert.deepEqual(stats, {
      total: 4,
      recommended: 2,
      withReservations: 1,
      notRecommended: 1,
      imprimatur: 1,
    });
  });
});
