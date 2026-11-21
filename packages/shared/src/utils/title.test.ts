import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatBookTitle } from './title.js';

describe('formatBookTitle', () => {
  it('converte títulos em caixa alta para Title Case PT-BR', () => {
    assert.equal(formatBookTitle('DOM CASMURRO'), 'Dom Casmurro');
    assert.equal(formatBookTitle('CRIME E CASTIGO'), 'Crime e Castigo');
  });

  it('padroniza títulos em minúsculas mantendo preposições e artigos em minúsculo no meio', () => {
    assert.equal(formatBookTitle('A morte de Ivan Ilitch'), 'A Morte de Ivan Ilitch');
    assert.equal(formatBookTitle('o senhor dos anéis: a sociedade do anel'), 'O Senhor dos Anéis: A Sociedade do Anel');
  });

  it('preserva algarismos romanos em maiúsculas', () => {
    assert.equal(formatBookTitle('história de dom joão vi'), 'História de Dom João VI');
  });
});
