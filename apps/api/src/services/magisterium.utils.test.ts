import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildMagisteriumMessages,
  computeEditorialAiInputHash,
  parseMagisteriumResponse,
} from './magisterium.utils.js';

describe('magisterium.utils', () => {
  it('gera inputHash determinístico e sensível a mudanças de sinopse ou ressalvas', () => {
    const hashA = computeEditorialAiInputHash({
      title: 'Confissões',
      authors: ['Santo Agostinho'],
      synopsis: 'Obra autobiográfica cristã.',
      reservations: [],
    });
    const hashB = computeEditorialAiInputHash({
      title: 'Confissões',
      authors: ['Santo Agostinho'],
      synopsis: 'Obra autobiográfica cristã.',
      reservations: [],
    });
    const hashC = computeEditorialAiInputHash({
      title: 'Confissões',
      authors: ['Santo Agostinho'],
      synopsis: 'Outra sinopse.',
      reservations: [],
    });

    assert.equal(hashA, hashB);
    assert.notEqual(hashA, hashC);
  });

  it('monta mensagens com instruções de limite e inclui ressalvas no prompt', () => {
    const messages = buildMagisteriumMessages({
      title: 'O Senhor dos Anéis',
      authors: ['J. R. R. Tolkien'],
      reservations: [
        {
          topic: 'VIOLENCE_GORE',
          severity: 'LOW',
          description: 'Cenas de batalha épica em contexto fantástico.',
        },
      ],
    });

    assert.equal(messages.length, 2);
    assert.match(messages[0]!.content, /Nunca invente detalhes do enredo/);
    assert.match(messages[1]!.content, /VIOLENCE_GORE/);
  });

  it('extrai veredito, faixa etária, justificativa e síntese limpa removendo markdown e rodapés', () => {
    const parsed = parseMagisteriumResponse({
      choices: [
        {
          message: {
            content: [
              'VEREDITO: WITH_RESERVATIONS',
              'IDADE: 14+',
              'JUSTIFICATIVA: Temática madura sobre ciúme e fidelidade conjugal que pede discernimento juvenil.',
              'SINTESE:',
              '### Rascunho de editorialSummary',
              '**Síntese** pastoral em *Obras* fundamentada no Magistério. [^1]',
            ].join('\n'),
          },
        },
      ],
      citations: [
        {
          cited_text: 'Os meios de comunicação social prestam relevantes serviços...',
          document_title: 'Inter Mirifica',
          document_author: 'Concílio Vaticano II',
          document_year: '1963',
          document_reference: '2',
          source_url: 'https://www.magisterium.com/doc/1',
        },
      ],
    });

    assert.ok(parsed);
    assert.equal(parsed.suggestedAdequacy, 'WITH_RESERVATIONS');
    assert.equal(parsed.suggestedAge, '14+');
    assert.match(parsed.recommendationRationale ?? '', /ciúme e fidelidade/i);
    assert.equal(parsed.draftText, 'Síntese pastoral em Obras fundamentada no Magistério.');
    assert.equal(parsed.citations.length, 1);
    assert.equal(parsed.citations[0]!.documentTitle, 'Inter Mirifica');
    assert.equal(parsed.citations[0]!.documentReference, '2');
  });

  it('extrai blocos mesmo quando rótulos vêm em Markdown e JUSTIFICATIVA tem múltiplos parágrafos', () => {
    const parsed = parseMagisteriumResponse({
      choices: [
        {
          message: {
            content: [
              '**VEREDITO:** Recomendado com ressalvas.',
              '**IDADE:** 16 anos ou mais.',
              '**JUSTIFICATIVA:** Primeiro parágrafo da justificativa.',
              '',
              'Segundo parágrafo da justificativa.',
              '',
              '**SÍNTESE:** Romance clássico sobre culpa e conversão.',
            ].join('\n'),
          },
        },
      ],
    });

    assert.ok(parsed);
    assert.equal(parsed.suggestedAdequacy, 'WITH_RESERVATIONS');
    assert.equal(parsed.suggestedAge, '16+');
    assert.match(parsed.recommendationRationale ?? '', /Primeiro parágrafo/i);
    assert.match(parsed.recommendationRationale ?? '', /Segundo parágrafo/i);
    assert.equal(parsed.draftText, 'Romance clássico sobre culpa e conversão.');
  });

  it('extrai veredito e idade em linguagem natural (ex.: 14 anos, Adequado com ressalvas) sem vazar rótulos para SÍNTESE', () => {
    const parsed = parseMagisteriumResponse({
      choices: [
        {
          message: {
            content: [
              'VEREDITO: Adequado com ressalvas.',
              'IDADE: Recomendado a partir de 14 anos. A classificação considera a sinopse.',
              'JUSTIFICATIVA: O romance aborda ciúme e conflitos conjugais.',
              'SÍNTESE: Clássico da literatura brasileira sobre memória e confiança no casamento.',
            ].join('\n\n'),
          },
        },
      ],
      citations: [],
    });

    assert.ok(parsed);
    assert.equal(parsed.suggestedAdequacy, 'WITH_RESERVATIONS');
    assert.equal(parsed.suggestedAge, '14+');
    assert.equal(parsed.recommendationRationale, 'O romance aborda ciúme e conflitos conjugais.');
    assert.equal(
      parsed.draftText,
      'Clássico da literatura brasileira sobre memória e confiança no casamento.',
    );
  });

  it('retorna null quando payload não segue o contrato esperado', () => {
    assert.equal(parseMagisteriumResponse({ choices: [] }), null);
    assert.equal(parseMagisteriumResponse(null), null);
  });
});
