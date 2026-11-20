import { model, Schema, type Types } from 'mongoose';
import {
  ADEQUACY_LEVELS,
  AGE_RATINGS,
  RESERVATION_TOPICS,
  SEVERITY_LEVELS,
  type Book,
  type ReservationItem,
} from '@app/shared';

/**
 * Tipo do documento no MongoDB: o contrato do @app/shared, exceto os campos que
 * mudam de representação (ids viram ObjectId; datas são geradas pelo Mongoose).
 */
export type BookAttrs = Omit<Book, '_id' | 'alternatives' | 'createdAt' | 'updatedAt'> & {
  alternatives: Types.ObjectId[];
};

export const reservationItemSchema = new Schema<ReservationItem>(
  {
    topic: { type: String, enum: [...RESERVATION_TOPICS], required: true },
    severity: { type: String, enum: [...SEVERITY_LEVELS], required: true },
    description: { type: String, required: true, trim: true, minlength: 10 },
    reference: { type: String, trim: true },
  },
  { _id: false },
);

const communityStatsSchema = new Schema(
  {
    totalReviews: { type: Number, default: 0, min: 0 },
    recommendedCount: { type: Number, default: 0, min: 0 },
    reservationsCount: { type: Number, default: 0, min: 0 },
    notRecommendedCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const bookSchema = new Schema<BookAttrs>(
  {
    isbn13: { type: String, required: true, trim: true, match: /^\d{13}$/ },
    googleBooksId: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    authors: { type: [String], required: true, validate: (v: string[]) => v.length > 0 },
    coverUrl: { type: String, trim: true },
    synopsis: { type: String, trim: true },
    publishedYear: { type: Number },
    publisher: { type: String, trim: true },
    pageCount: { type: Number },
    language: { type: String, trim: true },
    hasImprimatur: { type: Boolean, default: false },
    editorialLock: { type: Boolean, default: false },
    editorialLockedAt: { type: Date },
    editorialLockedBy: { type: String, trim: true },
    adequacyStatus: { type: String, enum: [...ADEQUACY_LEVELS], default: 'UNRATED' },
    recommendedAge: { type: String, enum: [...AGE_RATINGS], default: 'ALL' },
    tags: { type: [String], default: [] },
    editorialSummary: { type: String, trim: true },
    reservations: { type: [reservationItemSchema], default: [] },
    alternatives: { type: [Schema.Types.ObjectId], ref: 'Book', default: [] },
    communityStats: { type: communityStatsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

bookSchema.index({ isbn13: 1 }, { unique: true });
bookSchema.index({ adequacyStatus: 1, recommendedAge: 1 });
bookSchema.index({ tags: 1 });
bookSchema.index({ title: 1 });
bookSchema.index(
  { title: 'text', subtitle: 'text', authors: 'text' },
  {
    default_language: 'portuguese',
    language_override: 'textSearchLanguage',
    weights: { title: 5, authors: 3, subtitle: 1 },
  },
);

export const BookModel = model<BookAttrs>('Book', bookSchema);
