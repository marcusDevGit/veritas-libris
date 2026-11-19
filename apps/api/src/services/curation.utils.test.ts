import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sanitizeAlternativeIds } from './curation.utils.js';

describe('curation.utils', () => {
  it('sanitizeAlternativeIds remove o próprio ID da obra e duplicatas preservando a ordem', () => {
    const bookId = '507f1f77bcf86cd799439011';
    const input = [
      '507f1f77bcf86cd799439012',
      bookId,
      '507f1f77bcf86cd799439013',
      '507f1f77bcf86cd799439012',
    ];

    assert.deepEqual(sanitizeAlternativeIds(bookId, input), [
      '507f1f77bcf86cd799439012',
      '507f1f77bcf86cd799439013',
    ]);
  });
});
