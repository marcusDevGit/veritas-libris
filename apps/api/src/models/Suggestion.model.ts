import { model, Schema } from 'mongoose';
import { SUGGESTION_TYPES, type SuggestionType } from '@app/shared';

export interface SuggestionAttrs {
  type: SuggestionType;
  title: string;
  author?: string;
  isbn13?: string;
  senderName?: string;
  senderEmail?: string;
  message: string;
  createdAt: Date;
}

const suggestionSchema = new Schema<SuggestionAttrs>(
  {
    type: { type: String, enum: [...SUGGESTION_TYPES], required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    isbn13: { type: String, trim: true },
    senderName: { type: String, trim: true },
    senderEmail: { type: String, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

suggestionSchema.index({ createdAt: -1 });

export const SuggestionModel = model<SuggestionAttrs>('Suggestion', suggestionSchema);
