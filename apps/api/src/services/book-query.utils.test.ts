import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildBookFilter, buildBookSort } from './book-query.utils.js';

describe('book-query.utils', () => {
  it('buildBookFilter aplica familyMode sem colidir com filtro explícito de idade', () => {
    const filter = buildBookFilter({
      age: '12+',
      familyMode: true,
    });

    assert.deepEqual(filter, {
      $and: [
        { recommendedAge: '12+' },
        {
          recommendedAge: { $nin: ['16+', '18+'] },
          adequacyStatus: { $ne: 'NOT_RECOMMENDED' },
          'reservations.severity': { $ne: 'HIGH' },
        },
      ],
    });
  });

  it('buildBookFilter omite adequacy quando includeAdequacy=false para cálculo de contadores', () => {
    const filter = buildBookFilter(
      { adequacy: 'RECOMMENDED', hasImprimatur: true },
      { includeAdequacy: false },
    );

    assert.deepEqual(filter, { hasImprimatur: true });
  });

  it('buildBookFilter aplica filtro de clássico cristão quando stamp=classico-cristao', () => {
    const filter = buildBookFilter({ stamp: 'classico-cristao' });
    assert.deepEqual(filter, {
      adequacyStatus: 'RECOMMENDED',
      $or: [{ publishedYear: { $lt: 1970 } }, { publishedYear: { $exists: false } }],
    });
  });

  it('buildBookSort retorna ordenação esperada para cada opção', () => {
    assert.deepEqual(buildBookSort('alphabetical'), { title: 1, _id: 1 });
    assert.deepEqual(buildBookSort('recent'), { publishedYear: -1, updatedAt: -1, _id: 1 });
    assert.deepEqual(buildBookSort('most-reviewed', true), {
      score: { $meta: 'textScore' },
      'communityStats.totalReviews': -1,
      _id: 1,
    });
  });
});
