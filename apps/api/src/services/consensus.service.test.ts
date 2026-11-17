import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateConsensus } from './consensus.service.js';

describe('calculateConsensus', () => {
  it('retorna UNRATED e ALL quando não há avaliações', () => {
    const res = calculateConsensus({
      currentEditorialLock: false,
      reviews: [],
    });

    assert.equal(res.adequacyStatus, 'UNRATED');
    assert.equal(res.recommendedAge, 'ALL');
    assert.equal(res.communityStats.totalReviews, 0);
  });

  it('respeita a trava editorial manual (editorialLock)', () => {
    const res = calculateConsensus({
      currentEditorialLock: true,
      reviews: [
        {
          adequacyVote: 'NOT_RECOMMENDED',
          ageVote: '18+',
          isCurator: false,
          reservations: [],
          suggestedTags: [],
        },
      ],
    });

    assert.equal(res.communityStats.totalReviews, 1);
    assert.equal(res.communityStats.notRecommendedCount, 1);
    assert.equal(res.adequacyStatus, undefined);
    assert.equal(res.recommendedAge, undefined);
  });

  it('aplica princípio católico de prudência: 40%+ NOT_RECOMMENDED define o status', () => {
    const res = calculateConsensus({
      currentEditorialLock: false,
      reviews: [
        {
          adequacyVote: 'RECOMMENDED',
          ageVote: 'ALL',
          isCurator: false,
          reservations: [],
          suggestedTags: [],
        },
        {
          adequacyVote: 'RECOMMENDED',
          ageVote: 'ALL',
          isCurator: false,
          reservations: [],
          suggestedTags: [],
        },
        {
          adequacyVote: 'NOT_RECOMMENDED',
          ageVote: '16+',
          isCurator: true,
          reservations: [
            {
              topic: 'DOCTRINAL_ERROR',
              severity: 'HIGH',
              description: 'Nega a ressurreição da carne',
            },
          ],
          suggestedTags: ['apologetica'],
        },
      ],
    });

    assert.equal(res.adequacyStatus, 'NOT_RECOMMENDED');
    assert.equal(res.communityStats.totalReviews, 3);
    assert.equal(res.communityStats.recommendedCount, 2);
    assert.equal(res.communityStats.notRecommendedCount, 1);
    assert.equal(res.reservations.length, 1);
    assert.equal(res.reservations[0]?.topic, 'DOCTRINAL_ERROR');
    assert.equal(res.reservations[0]?.severity, 'HIGH');
    assert.deepEqual(res.tags, ['apologetica']);
  });

  it('consolida ressalvas de múltiplos usuários preservando a maior severidade', () => {
    const res = calculateConsensus({
      currentEditorialLock: false,
      reviews: [
        {
          adequacyVote: 'WITH_RESERVATIONS',
          ageVote: '14+',
          isCurator: false,
          reservations: [
            {
              topic: 'SENSUAL_CONTENT',
              severity: 'LOW',
              description: 'Cenas românticas no capítulo 2',
            },
          ],
          suggestedTags: [],
        },
        {
          adequacyVote: 'WITH_RESERVATIONS',
          ageVote: '16+',
          isCurator: false,
          reservations: [
            {
              topic: 'SENSUAL_CONTENT',
              severity: 'HIGH',
              description: 'Conteúdo explícito no capítulo 10',
            },
          ],
          suggestedTags: [],
        },
      ],
    });

    assert.equal(res.reservations.length, 1);
    assert.equal(res.reservations[0]?.topic, 'SENSUAL_CONTENT');
    assert.equal(res.reservations[0]?.severity, 'HIGH'); // Elevado para HIGH
  });
});
