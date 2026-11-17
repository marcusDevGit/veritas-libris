import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isbn10ToIsbn13, isValidIsbn10, isValidIsbn13, normalizeIsbn } from './isbn.js';

describe('isValidIsbn13', () => {
  it('aceita ISBN-13 com dígito verificador correto', () => {
    assert.equal(isValidIsbn13('9780306406157'), true);
    assert.equal(isValidIsbn13('9788533613379'), true);
  });

  it('rejeita dígito verificador errado', () => {
    assert.equal(isValidIsbn13('9780306406158'), false);
  });

  it('rejeita tamanho errado e caracteres não numéricos', () => {
    assert.equal(isValidIsbn13('978030640615'), false);
    assert.equal(isValidIsbn13('97803064061577'), false);
    assert.equal(isValidIsbn13('978030640615X'), false);
    assert.equal(isValidIsbn13(''), false);
  });

  it('rejeita ISBN-13 fictício com miolo todo zerado', () => {
    assert.equal(isValidIsbn13('9780000000002'), false);
  });
});

describe('isValidIsbn10', () => {
  it('aceita ISBN-10 válido, inclusive terminado em X', () => {
    assert.equal(isValidIsbn10('0306406152'), true);
    assert.equal(isValidIsbn10('080442957X'), true);
  });

  it('rejeita dígito verificador errado', () => {
    assert.equal(isValidIsbn10('0306406153'), false);
  });
});

describe('isbn10ToIsbn13', () => {
  it('converte mantendo o livro e recalculando o dígito verificador', () => {
    assert.equal(isbn10ToIsbn13('0306406152'), '9780306406157');
  });
});

describe('normalizeIsbn', () => {
  it('ignora hifens e espaços', () => {
    assert.equal(normalizeIsbn('978-0-306-40615-7'), '9780306406157');
    assert.equal(normalizeIsbn(' 978 0306406157 '), '9780306406157');
  });

  it('converte ISBN-10 para ISBN-13', () => {
    assert.equal(normalizeIsbn('0-306-40615-2'), '9780306406157');
  });

  it('aceita "x" minúsculo no ISBN-10', () => {
    assert.equal(normalizeIsbn('080442957x'), isbn10ToIsbn13('080442957X'));
  });

  it('devolve null para entradas inválidas', () => {
    assert.equal(normalizeIsbn('9780306406158'), null);
    assert.equal(normalizeIsbn('abc'), null);
    assert.equal(normalizeIsbn('Dom Casmurro'), null);
    assert.equal(normalizeIsbn(''), null);
  });
});
