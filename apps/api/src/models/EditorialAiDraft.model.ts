import { model, Schema, type Types } from 'mongoose';
import {
  ADEQUACY_LEVELS,
  AGE_RATINGS,
  type AdequacyLevel,
  type AgeRating,
  type EditorialAiCitation,
} from '@app/shared';

export interface EditorialAiDraftAttrs {
  bookId: Types.ObjectId;
  inputHash: string;
  draftText: string;
  suggestedAdequacy?: AdequacyLevel | null;
  suggestedAge?: AgeRating | null;
  recommendationRationale?: string | null;
  citations: EditorialAiCitation[];
  createdAt: Date;
}

const citationSchema = new Schema<EditorialAiCitation>(
  {
    documentTitle: { type: String, trim: true },
    documentAuthor: { type: String, trim: true },
    documentYear: { type: String, trim: true },
    documentReference: { type: String, trim: true },
    citedText: { type: String, required: true, trim: true },
    sourceUrl: { type: String, trim: true },
  },
  { _id: false },
);

const editorialAiDraftSchema = new Schema<EditorialAiDraftAttrs>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    inputHash: { type: String, required: true, trim: true },
    draftText: { type: String, required: true },
    suggestedAdequacy: { type: String, enum: [...ADEQUACY_LEVELS], default: null },
    suggestedAge: { type: String, enum: [...AGE_RATINGS], default: null },
    recommendationRationale: { type: String, trim: true, default: null },
    citations: { type: [citationSchema], default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

editorialAiDraftSchema.index({ bookId: 1, inputHash: 1 }, { unique: true });
editorialAiDraftSchema.index({ createdAt: 1 }, { expireAfterSeconds: NINETY_DAYS_SECONDS });

export const EditorialAiDraftModel = model<EditorialAiDraftAttrs>(
  'EditorialAiDraft',
  editorialAiDraftSchema,
);
