import type { AdequacyLevel } from '@app/shared';
import {
  buildMagisteriumMessages,
  parseMagisteriumResponse,
  type MagisteriumPromptBookInput,
} from './magisterium.utils.js';

export interface GoldenEvalCase {
  id: string;
  book: MagisteriumPromptBookInput;
  expectedAdequacy: AdequacyLevel;
  simulatedModelOutput: string;
}

export interface EvalCaseResult {
  id: string;
  title: string;
  formatValid: boolean;
  verdictMatched: boolean;
  noMarkdownLeak: boolean;
  passed: boolean;
}

export interface EvalSuiteReport {
  total: number;
  passed: number;
  formatPassRate: number;
  verdictAgreementRate: number;
  results: EvalCaseResult[];
}

export const MAGISTERIUM_GOLDEN_SET: GoldenEvalCase[] = [
  {
    id: 'confissoes',
    book: {
      title: 'Confissões',
      authors: ['Santo Agostinho'],
      synopsis: 'Autobiografia espiritual sobre conversão, graça e misericórdia divina.',
      reservations: [],
    },
    expectedAdequacy: 'RECOMMENDED',
    simulatedModelOutput:
      'VEREDITO: RECOMMENDED\nIDADE: 14+\nJUSTIFICATIVA: Obra patrística edificante que conduz à conversão e ao exame de consciência.\nSINTESE:\nClássico da espiritualidade cristã que narra a busca pela Verdade e a ação da graça na alma humana.',
  },
  {
    id: 'crime-e-castigo',
    book: {
      title: 'Crime e Castigo',
      authors: ['Fiódor Dostoiévski'],
      synopsis: 'Romance psicológico sobre culpa, niilismo e redenção cristã.',
      reservations: [
        { topic: 'VIOLENCE_GORE', severity: 'MEDIUM', description: 'Homicídio e angústia psicológica.' },
      ],
    },
    expectedAdequacy: 'WITH_RESERVATIONS',
    simulatedModelOutput:
      'VEREDITO: WITH_RESERVATIONS\nIDADE: 16+\nJUSTIFICATIVA: Apresenta cenas densas de crime e niilismo, mas conduz o protagonista à confissão e redenção.\nSINTESE:\nObra-prima que expõe as consequências morais do relativismo e aponta para a misericórdia redentora.',
  },
  {
    id: 'relativismo-radical',
    book: {
      title: 'Obra de Desconstrução Moral',
      authors: ['Autor Fictício'],
      synopsis: 'Defesa explícita do relativismo moral e negação da lei natural.',
      reservations: [
        { topic: 'MORAL_RELATIVISM', severity: 'HIGH', description: 'Nega verdades morais objetivas.' },
      ],
    },
    expectedAdequacy: 'NOT_RECOMMENDED',
    simulatedModelOutput:
      'VEREDITO: NOT_RECOMMENDED\nIDADE: 18+\nJUSTIFICATIVA: Contradiz diretamente os fundamentos da lei natural e da moral cristã.\nSINTESE:\nTexto que promove o relativismo ético sem contraponto formativo adequado para leitores em formação.',
  },
  {
    id: 'sem-sinopse',
    book: {
      title: 'Manual de Orações Clássicas',
      authors: ['Autor Católico'],
      reservations: [],
    },
    expectedAdequacy: 'RECOMMENDED',
    simulatedModelOutput:
      'VEREDITO: RECOMMENDED\nIDADE: ALL\nJUSTIFICATIVA: Devocionário tradicional compatível com todas as idades.\nSINTESE:\nColetânea de orações tradicionais voltada à piedade familiar e à vida sacramental.',
  },
];

export function runOfflineMagisteriumEval(cases: GoldenEvalCase[] = MAGISTERIUM_GOLDEN_SET): EvalSuiteReport {
  const results: EvalCaseResult[] = cases.map((item) => {
    // Garante que o prompt monta sem erro dentro dos limites de reservas/sinopse
    buildMagisteriumMessages(item.book);

    const parsed = parseMagisteriumResponse({
      choices: [{ message: { content: item.simulatedModelOutput } }],
      citations: [],
    });

    const formatValid = Boolean(parsed && parsed.draftText.length > 0 && parsed.suggestedAdequacy && parsed.suggestedAge);
    const verdictMatched = parsed?.suggestedAdequacy === item.expectedAdequacy;
    const noMarkdownLeak = Boolean(parsed && !/\*\*|^#{1,6}\s/m.test(parsed.draftText));
    const passed = formatValid && verdictMatched && noMarkdownLeak;

    return {
      id: item.id,
      title: item.book.title,
      formatValid,
      verdictMatched,
      noMarkdownLeak,
      passed,
    };
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const formatPassCount = results.filter((r) => r.formatValid).length;
  const agreementCount = results.filter((r) => r.verdictMatched).length;

  return {
    total,
    passed,
    formatPassRate: total === 0 ? 0 : formatPassCount / total,
    verdictAgreementRate: total === 0 ? 0 : agreementCount / total,
    results,
  };
}
