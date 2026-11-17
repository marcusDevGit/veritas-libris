import { model, Schema, type Types } from 'mongoose';
import { ADEQUACY_LEVELS, AGE_RATINGS, type Review } from '@app/shared';
import { reservationItemSchema } from './Book.model.js';

export type ReviewAttrs = Omit<Review, '_id' | 'bookId' | 'createdAt' | 'updatedAt'> & {
  bookId: Types.ObjectId;
  helpfulUserIds: string[];
};

const reviewSchema = new Schema<ReviewAttrs>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true },
    isCurator: { type: Boolean, default: false },
    adequacyVote: {
      type: String,
      enum: ADEQUACY_LEVELS.filter((level) => level !== 'UNRATED'),
      required: true,
    },
    ageVote: { type: String, enum: [...AGE_RATINGS], required: true },
    suggestedTags: { type: [String], default: [] },
    reservations: { type: [reservationItemSchema], default: [] },
    comment: { type: String, required: true, trim: true, minlength: 10 },
    helpfulVotes: { type: Number, default: 0, min: 0 },
    helpfulUserIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ bookId: 1, helpfulVotes: -1, createdAt: -1 });

export const ReviewModel = model<ReviewAttrs>('Review', reviewSchema);
