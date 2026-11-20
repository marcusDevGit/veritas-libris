import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSuggestionFilter, computeSuggestionStats } from './suggestion.utils.js';

describe('suggestion.utils', () => {
  it('trata documentos sem status explícito como PENDING tanto no filtro quanto nos contadores', () => {
    const filter = buildSuggestionFilter({ status: 'PENDING' });
    assert.deepEqual(filter, {
      $or: [{ status: 'PENDING' }, { status: { $exists: false } }],
    });

    const stats = computeSuggestionStats([
      { status: undefined },
      { status: 'PENDING' },
      { status: 'REVIEWED' },
      { status: 'ACCEPTED' },
      { status: 'DISMISSED' },
    ]);

    assert.deepEqual(stats, {
      total: 5,
      pending: 2,
      reviewed: 1,
      accepted: 1,
      dismissed: 1,
    });
  });

  it('escapa caracteres especiais de regex na busca textual e combina com tipo', () => {
    const filter = buildSuggestionFilter({ type: 'BOOK', q: 'Catecismo (2ª ed.)' });
    assert.ok('$and' in filter);
    const clauses = filter.$and as Array<Record<string, unknown>>;
    assert.equal(clauses.length, 2);
    assert.deepEqual(clauses[0], { type: 'BOOK' });
    assert.ok(clauses[1] && '$or' in clauses[1]);
  });
});
