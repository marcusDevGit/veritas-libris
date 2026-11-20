import type {
  CreateSuggestionBody,
  SuggestionDto,
  SuggestionListQuery,
  SuggestionListResponse,
  SuggestionStatus,
  UpdateSuggestionStatusBody,
} from '@app/shared';
import { NotFoundError } from '../errors/app-error.js';
import { AuditLogModel } from '../models/AuditLog.model.js';
import { SuggestionModel, type SuggestionAttrs } from '../models/Suggestion.model.js';
import { buildSuggestionFilter, computeSuggestionStats } from './suggestion.utils.js';

const STATUS_LABELS: Record<SuggestionStatus, string> = {
  PENDING: 'Pendente',
  REVIEWED: 'Em análise',
  ACCEPTED: 'Aceita',
  DISMISSED: 'Descartada',
};

function toSuggestionDto(doc: SuggestionAttrs & { _id: unknown }): SuggestionDto {
  return {
    id: String(doc._id),
    type: doc.type,
    title: doc.title,
    author: doc.author ?? null,
    isbn13: doc.isbn13 ?? null,
    senderName: doc.senderName ?? null,
    senderEmail: doc.senderEmail ?? null,
    message: doc.message,
    status: doc.status ?? 'PENDING',
    reviewedByName: doc.reviewedByName ?? null,
    reviewedAt: doc.reviewedAt ? doc.reviewedAt.toISOString() : null,
    resolutionNote: doc.resolutionNote ?? null,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function createSuggestion(body: CreateSuggestionBody): Promise<SuggestionDto> {
  const created = await SuggestionModel.create({
    type: body.type,
    title: body.title,
    author: body.author || undefined,
    isbn13: body.isbn13 || undefined,
    senderName: body.senderName || undefined,
    senderEmail: body.senderEmail || undefined,
    message: body.message,
    status: 'PENDING',
  });

  return toSuggestionDto(created.toObject());
}

export async function listSuggestions(
  query: Partial<SuggestionListQuery> = {},
): Promise<SuggestionListResponse> {
  const filter = buildSuggestionFilter(query);
  const limit = query.limit ?? 50;

  const [docs, allStatuses] = await Promise.all([
    SuggestionModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<Array<SuggestionAttrs & { _id: unknown }>>(),
    SuggestionModel.find({}, { status: 1 }).lean<Array<{ status?: SuggestionStatus }>>(),
  ]);

  return {
    items: docs.map(toSuggestionDto),
    stats: computeSuggestionStats(allStatuses),
  };
}

export async function triageSuggestion(
  id: string,
  body: UpdateSuggestionStatusBody,
  actor: { uid: string; name: string },
): Promise<SuggestionDto> {
  const suggestion = await SuggestionModel.findById(id);
  if (!suggestion) {
    throw new NotFoundError('Sugestão não encontrada');
  }

  suggestion.status = body.status;
  suggestion.reviewedByUid = actor.uid;
  suggestion.reviewedByName = actor.name;
  suggestion.reviewedAt = new Date();
  if (body.resolutionNote !== undefined) {
    suggestion.resolutionNote = body.resolutionNote.trim() || undefined;
  }

  await suggestion.save();

  await AuditLogModel.create({
    action: 'SUGGESTION_TRIAGED',
    actorUid: actor.uid,
    actorName: actor.name,
    targetId: String(suggestion._id),
    targetLabel: suggestion.title,
    details: `marcou sugestão como ${STATUS_LABELS[body.status]}`,
  });

  return toSuggestionDto(suggestion.toObject());
}
