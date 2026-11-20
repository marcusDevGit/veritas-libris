import { createHash } from 'node:crypto';
import { z } from 'zod';
import {
  AGE_RATINGS,
  type AdequacyLevel,
  type AgeRating,
  type EditorialAiCitation,
  type ReservationItem,
} from '@app/shared';

export interface MagisteriumPromptBookInput {
  title: string;
  authors: string[];
  synopsis?: string;
  reservations: ReservationItem[];
}

const VALID_SUGGESTED_ADEQUACY = new Set<AdequacyLevel>([
  'RECOMMENDED',
  'WITH_RESERVATIONS',
  'NOT_RECOMMENDED',
]);
const VALID_AGE_RATINGS = new Set<AgeRating>(AGE_RATINGS);

const RawMagisteriumCitationSchema = z.object({
  cited_text: z.string(),
  cited_text_heading: z.string().nullable().optional(),
  document_title: z.string().nullable().optional(),
  document_author: z.string().nullable().optional(),
  document_year: z.string().nullable().optional(),
  document_reference: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
});

const RawMagisteriumResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().min(1),
        }),
      }),
    )
    .min(1),
  citations: z.array(RawMagisteriumCitationSchema).optional().default([]),
});

const PROMPT_VERSION = 'v5';

export function computeEditorialAiInputHash(book: MagisteriumPromptBookInput): string {
  const payload = JSON.stringify({
    promptVersion: PROMPT_VERSION,
    title: book.title.trim(),
    authors: book.authors.map((a) => a.trim()),
    synopsis: (book.synopsis ?? '').trim().slice(0, 1200),
    reservations: book.reservations.map((r) => ({
      topic: r.topic,
      severity: r.severity,
      description: r.description.trim(),
    })),
  });
  return createHash('sha256').update(payload).digest('hex');
}

export function buildMagisteriumMessages(
  book: MagisteriumPromptBookInput,
): Array<{ role: 'system' | 'user'; content: string }> {
  const reservationsText =
    book.reservations.length > 0
      ? book.reservations
          .map((r) => `- ${r.topic} (${r.severity}): ${r.description}`)
          .join('\n')
      : 'Nenhuma ressalva comunitária consolidada até o momento.';

  const synopsisText = book.synopsis?.trim()
    ? book.synopsis.trim().slice(0, 1200)
    : 'Sinopse não disponível no catálogo.';

  return [
    {
      role: 'system',
      content: [
        'Você é um assistente editorial católico do projeto Veritas Libris.',
        'Responda em português brasileiro em texto puro (sem Markdown **, *, _, # ou marcadores [^1]), seguindo exatamente este formato:',
        'VEREDITO: RECOMMENDED | WITH_RESERVATIONS | NOT_RECOMMENDED',
        'IDADE: ALL | 10+ | 12+ | 14+ | 16+ | 18+',
        'JUSTIFICATIVA: 1 parágrafo curto explicando ao curador o porquê da sugestão de veredito e faixa etária.',
        'SINTESE:',
        '1 a 2 parágrafos concisos (500 a 1.000 caracteres) de síntese pastoral pronta para a ficha pública da obra, fundamentada no Magistério (citando documentos naturalmente no texto, sem títulos internos).',
        'Nunca invente detalhes do enredo que não constem nos dados enviados.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `Obra: ${book.title}`,
        `Autores: ${book.authors.join(', ')}`,
        `Sinopse cadastrada: ${synopsisText}`,
        `Ressalvas comunitárias:\n${reservationsText}`,
        'Preencha os 4 blocos (VEREDITO, IDADE, JUSTIFICATIVA e SINTESE) para revisão do curador.',
      ].join('\n\n'),
    },
  ];
}

function stripMarkdownDecorators(rawContent: string): string {
  return rawContent
    .replace(/\r\n/g, '\n')
    .replace(/\s*\[\^\d+\]/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/(^|\s)\*([^*\n]+)\*/g, '$1$2');
}

function sanitizeDraftText(rawContent: string): string {
  const cleaned = stripMarkdownDecorators(rawContent)
    .replace(/^(?:Rascunho(?:\s+de)?\s+editorialSummary|Fundamenta[çc][ãa]o(?:\s+e\s+observa[çc][õo]es.*)?)\s*:?\s*/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleaned.length <= 2200) {
    return cleaned;
  }
  return `${cleaned.slice(0, 2197).trimEnd()}...`;
}

function normalizeSuggestedAdequacy(raw?: string | null): AdequacyLevel | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase() as AdequacyLevel;
  if (VALID_SUGGESTED_ADEQUACY.has(upper)) return upper;
  if (/DESACONSELH|N[ÃA]O RECOMEND/i.test(raw)) return 'NOT_RECOMMENDED';
  if (/RESSALV/i.test(raw)) return 'WITH_RESERVATIONS';
  if (/RECOMEND/i.test(raw)) return 'RECOMMENDED';
  return null;
}

function normalizeSuggestedAge(raw?: string | null): AgeRating | null {
  if (!raw) return null;
  const trimmed = raw.trim().toUpperCase();
  const numericMatch = trimmed.match(/\b(10|12|14|16|18)\s*(?:\+|ANOS)?\b/i);
  if (numericMatch) {
    const candidate = `${numericMatch[1]}+` as AgeRating;
    if (VALID_AGE_RATINGS.has(candidate)) {
      return candidate;
    }
  }
  if (/LIVRE|\bALL\b|TODAS/i.test(trimmed)) return 'ALL';
  return null;
}

function extractStructuredSections(rawContent: string): {
  draftText: string;
  suggestedAdequacy: AdequacyLevel | null;
  suggestedAge: AgeRating | null;
  recommendationRationale: string | null;
} {
  const normalized = stripMarkdownDecorators(rawContent);
  const verdictMatch = normalized.match(/^\s*VEREDITO:\s*(.+)$/im);
  const ageMatch = normalized.match(/^\s*IDADE:\s*(.+)$/im);
  const rationaleMatch = normalized.match(
    /^\s*JUSTIFICATIVA:\s*([\s\S]*?)(?=\n\s*S[IÍ]NTESE\s*:|(?![\s\S]))/im,
  );
  const synthesisMatch = normalized.match(/^\s*S[IÍ]NTESE:\s*([\s\S]+)$/im);

  const suggestedAdequacy = normalizeSuggestedAdequacy(verdictMatch?.[1]);
  const suggestedAge = normalizeSuggestedAge(ageMatch?.[1]);
  const rawRationale = rationaleMatch?.[1]?.trim();
  const recommendationRationale = rawRationale ? sanitizeDraftText(rawRationale) : null;

  const rawDraft =
    synthesisMatch?.[1] ??
    normalized
      .replace(/^\s*VEREDITO:.*$/gim, '')
      .replace(/^\s*IDADE:.*$/gim, '')
      .replace(/^\s*JUSTIFICATIVA:\s*[\s\S]*$/im, '');

  const draftText = sanitizeDraftText(rawDraft);

  return {
    draftText,
    suggestedAdequacy,
    suggestedAge,
    recommendationRationale,
  };
}

export function parseMagisteriumResponse(raw: unknown): {
  draftText: string;
  suggestedAdequacy: AdequacyLevel | null;
  suggestedAge: AgeRating | null;
  recommendationRationale: string | null;
  citations: EditorialAiCitation[];
} | null {
  const parsed = RawMagisteriumResponseSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const rawContent = parsed.data.choices[0]?.message.content.trim();
  if (!rawContent) {
    return null;
  }

  const extracted = extractStructuredSections(rawContent);
  if (!extracted.draftText) {
    return null;
  }

  const citations: EditorialAiCitation[] = parsed.data.citations.slice(0, 8).map((c) => {
    const cleanText = c.cited_text.replace(/\s+/g, ' ').trim();
    return {
      citedText: cleanText.length > 360 ? `${cleanText.slice(0, 357)}...` : cleanText,
      documentTitle: c.document_title?.trim() || c.cited_text_heading?.trim() || null,
      documentAuthor: c.document_author?.trim() || null,
      documentYear: c.document_year?.trim() || null,
      documentReference: c.document_reference?.trim() || null,
      sourceUrl: c.source_url?.trim() || null,
    };
  });

  return {
    ...extracted,
    citations,
  };
}
