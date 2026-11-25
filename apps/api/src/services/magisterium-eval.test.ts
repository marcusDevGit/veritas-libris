import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runOfflineMagisteriumEval } from './magisterium-eval.js';

describe('magisterium-eval (Golden Set offline)', () => {
  it('valida aderência ao contrato, concordância de veredito e ausência de vazamento Markdown', () => {
    const report = runOfflineMagisteriumEval();
    assert.ok(report.total >= 4);
    assert.equal(report.passed, report.total);
    assert.equal(report.formatPassRate, 1);
    assert.equal(report.verdictAgreementRate, 1);
  });
});
