import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeAlternativeIds, sanitizeTags } from './curation.utils.js';

describe('curation.utils', () => {
  it('sanitizeAlternativeIds remove o próprio ID e duplicatas preservando a ordem', () => {
    assert.deepEqual(sanitizeAlternativeIds('b1', ['b2', 'b1', 'b3', 'b2']), ['b2', 'b3']);
  });

  it('sanitizeTags faz trim, ignora vazios e deduplica sem diferenciar maiúsculas', () => {
    assert.deepEqual(sanitizeTags(['  Apologética ', '', 'apologética', 'Virtudes Cristãs']), [
      'Apologética',
      'Virtudes Cristãs',
    ]);
  });
});
