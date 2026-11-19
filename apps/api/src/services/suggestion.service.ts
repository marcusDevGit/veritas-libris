import type { CreateSuggestionBody, SuggestionDto } from '@app/shared';
import { SuggestionModel, type SuggestionAttrs } from '../models/Suggestion.model.js';

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
  });

  return toSuggestionDto(created.toObject());
}

export async function listSuggestions(limit = 30): Promise<SuggestionDto[]> {
  const docs = await SuggestionModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<Array<SuggestionAttrs & { _id: unknown }>>();

  return docs.map(toSuggestionDto);
}
