import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluateReviewDeletion } from './review-moderation.utils.js';

describe('evaluateReviewDeletion', () => {
  it('permite exclusão pelo próprio autor sem marcar como moderação', () => {
    const decision = evaluateReviewDeletion('uid-1', { uid: 'uid-1', isCurator: false });
    assert.deepEqual(decision, { allowed: true, isModeration: false });
  });

  it('permite remoção por curador ou admin em parecer de terceiro marcando como moderação', () => {
    const decision = evaluateReviewDeletion('uid-1', { uid: 'uid-2', isCurator: true });
    assert.deepEqual(decision, { allowed: true, isModeration: true });
  });

  it('bloqueia remoção por leitor comum em parecer de terceiro', () => {
    const decision = evaluateReviewDeletion('uid-1', { uid: 'uid-3', isCurator: false });
    assert.deepEqual(decision, { allowed: false, isModeration: false });
  });
});
