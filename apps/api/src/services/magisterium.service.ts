import type { EditorialAiDraftResponse } from '@app/shared';
import { env } from '../config/env.js';
import {
  AppError,
  ExternalServiceError,
  ExternalServiceTimeoutError,
  NotFoundError,
} from '../errors/app-error.js';
import { AuditLogModel } from '../models/AuditLog.model.js';
import { BookModel } from '../models/Book.model.js';
import {
  EditorialAiDraftModel,
  type EditorialAiDraftAttrs,
} from '../models/EditorialAiDraft.model.js';
import type { BookLean } from './book.service.js';
import {
  buildMagisteriumMessages,
  computeEditorialAiInputHash,
  parseMagisteriumResponse,
} from './magisterium.utils.js';
import { logProviderFailure } from './provider-logger.js';

const MAGISTERIUM_API_URL = 'https://www.magisterium.com/api/v1/chat/completions';
const MAGISTERIUM_MODEL = 'magisterium-1';
const MAGISTERIUM_TIMEOUT_MS = 45_000;

export async function generateEditorialAiDraft(
  bookId: string,
  actor: { uid: string; name: string },
): Promise<EditorialAiDraftResponse> {
  const book = await BookModel.findById(bookId).lean<BookLean | null>();
  if (!book) {
    throw new NotFoundError('Obra não encontrada no catálogo');
  }

  const promptInput = {
    title: book.title,
    authors: book.authors,
    synopsis: book.synopsis,
    reservations: book.reservations ?? [],
  };
  const inputHash = computeEditorialAiInputHash(promptInput);

  const cached = await EditorialAiDraftModel.findOne({
    bookId: book._id,
    inputHash,
  }).lean<EditorialAiDraftAttrs | null>();

  if (cached) {
    return {
      draftText: cached.draftText,
      suggestedAdequacy: cached.suggestedAdequacy ?? null,
      suggestedAge: cached.suggestedAge ?? null,
      recommendationRationale: cached.recommendationRationale ?? null,
      citations: cached.citations,
      cached: true,
      generatedAt: cached.createdAt.toISOString(),
    };
  }

  if (!env.MAGISTERIUM_API_KEY) {
    throw new AppError(
      503,
      'A integração com a Magisterium AI ainda não está configurada no servidor (MAGISTERIUM_API_KEY ausente).',
      'MAGISTERIUM_NOT_CONFIGURED',
    );
  }

  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(MAGISTERIUM_API_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(MAGISTERIUM_TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MAGISTERIUM_API_KEY}`,
      },
      body: JSON.stringify({
        model: MAGISTERIUM_MODEL,
        messages: buildMagisteriumMessages(promptInput),
      }),
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'TimeoutError';
    logProviderFailure({
      provider: 'magisterium-ai',
      operation: 'chat_completions',
      durationMs: Date.now() - startedAt,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      reason: isTimeout ? 'Timeout' : error instanceof Error ? error.message : 'Erro de rede',
    });
    if (isTimeout) {
      throw new ExternalServiceTimeoutError('A Magisterium AI demorou demais para responder.');
    }
    throw new ExternalServiceError('Não foi possível consultar a Magisterium AI no momento.');
  }

  if (!response.ok) {
    logProviderFailure({
      provider: 'magisterium-ai',
      operation: 'chat_completions',
      durationMs: Date.now() - startedAt,
      statusCode: response.status,
      reason: `HTTP ${response.status}`,
    });
    throw new ExternalServiceError('A Magisterium AI retornou uma falha na consulta.');
  }

  const body: unknown = await response.json().catch(() => null);
  const parsed = parseMagisteriumResponse(body);
  if (!parsed) {
    logProviderFailure({
      provider: 'magisterium-ai',
      operation: 'chat_completions',
      durationMs: Date.now() - startedAt,
      reason: 'Payload fora do contrato esperado',
    });
    throw new ExternalServiceError('Resposta inesperada da Magisterium AI.');
  }

  const saved = await EditorialAiDraftModel.findOneAndUpdate(
    { bookId: book._id, inputHash },
    {
      $setOnInsert: {
        bookId: book._id,
        inputHash,
        draftText: parsed.draftText,
        suggestedAdequacy: parsed.suggestedAdequacy,
        suggestedAge: parsed.suggestedAge,
        recommendationRationale: parsed.recommendationRationale,
        citations: parsed.citations,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  ).lean<EditorialAiDraftAttrs>();

  await AuditLogModel.create({
    action: 'AI_DRAFT_GENERATED',
    actorUid: actor.uid,
    actorName: actor.name,
    targetId: bookId,
    targetLabel: book.title,
    details: 'consultou apoio doutrinário via Magisterium AI',
  });

  return {
    draftText: saved?.draftText ?? parsed.draftText,
    suggestedAdequacy: saved?.suggestedAdequacy ?? parsed.suggestedAdequacy,
    suggestedAge: saved?.suggestedAge ?? parsed.suggestedAge,
    recommendationRationale: saved?.recommendationRationale ?? parsed.recommendationRationale,
    citations: saved?.citations ?? parsed.citations,
    cached: false,
    generatedAt: (saved?.createdAt ?? new Date()).toISOString(),
  };
}
