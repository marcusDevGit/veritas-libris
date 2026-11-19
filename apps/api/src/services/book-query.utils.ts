import type { BookListQuery, BookSortOption } from '@app/shared';

export function buildBookFilter(
  query: Partial<BookListQuery>,
  options: { includeAdequacy?: boolean } = {},
): Record<string, unknown> {
  const includeAdequacy = options.includeAdequacy ?? true;
  const conditions: Record<string, unknown>[] = [];

  if (query.q) {
    conditions.push({ $text: { $search: query.q } });
  }

  if (includeAdequacy && query.adequacy) {
    conditions.push({ adequacyStatus: query.adequacy });
  }

  if (query.age) {
    conditions.push({ recommendedAge: query.age });
  }

  if (query.tags && query.tags.length > 0) {
    conditions.push({ tags: { $all: query.tags } });
  }

  if (query.familyMode) {
    conditions.push({
      recommendedAge: { $nin: ['16+', '18+'] },
      adequacyStatus: { $ne: 'NOT_RECOMMENDED' },
      'reservations.severity': { $ne: 'HIGH' },
    });
  }

  if (query.hasImprimatur || query.stamp === 'imprimatur') {
    conditions.push({ hasImprimatur: true });
  } else if (query.stamp === 'classico-cristao') {
    conditions.push({
      adequacyStatus: 'RECOMMENDED',
      $or: [{ publishedYear: { $lt: 1970 } }, { publishedYear: { $exists: false } }],
    });
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0] ?? {};
  return { $and: conditions };
}

export function buildBookSort(
  sort: BookSortOption = 'most-reviewed',
  hasTextQuery = false,
): Record<string, 1 | -1 | { $meta: 'textScore' }> {
  if (hasTextQuery && sort === 'most-reviewed') {
    return { score: { $meta: 'textScore' }, 'communityStats.totalReviews': -1, _id: 1 };
  }

  switch (sort) {
    case 'alphabetical':
      return { title: 1, _id: 1 };
    case 'recent':
      return { publishedYear: -1, updatedAt: -1, _id: 1 };
    case 'strict-moral':
      return {
        'communityStats.notRecommendedCount': 1,
        'communityStats.reservationsCount': 1,
        title: 1,
        _id: 1,
      };
    case 'most-reviewed':
    default:
      return { 'communityStats.totalReviews': -1, title: 1, _id: 1 };
  }
}
