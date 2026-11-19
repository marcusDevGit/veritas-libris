import { model, Schema, type Types } from 'mongoose';

export interface ReadingListItemAttrs {
  userId: string;
  bookId: Types.ObjectId;
  createdAt: Date;
}

const readingListItemSchema = new Schema<ReadingListItemAttrs>(
  {
    userId: { type: String, required: true, trim: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

readingListItemSchema.index({ userId: 1, bookId: 1 }, { unique: true });
readingListItemSchema.index({ userId: 1, createdAt: -1 });

export const ReadingListItemModel = model<ReadingListItemAttrs>(
  'ReadingListItem',
  readingListItemSchema,
);
