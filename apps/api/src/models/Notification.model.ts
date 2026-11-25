import { model, Schema, type Types } from 'mongoose';
import { NOTIFICATION_TYPES, type NotificationType } from '@app/shared';

export interface NotificationAttrs {
  userId: string;
  bookId?: Types.ObjectId;
  bookTitle?: string;
  link?: string;
  dedupKey?: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  archived: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationAttrs>(
  {
    userId: { type: String, required: true, trim: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: false },
    bookTitle: { type: String, required: false, trim: true },
    link: { type: String, required: false, trim: true },
    dedupKey: { type: String, required: false, trim: true },
    type: { type: String, enum: [...NOTIFICATION_TYPES], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, archived: 1, createdAt: -1 });
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: THIRTY_DAYS_SECONDS, partialFilterExpression: { archived: true } },
);
notificationSchema.index({ userId: 1, dedupKey: 1 }, { sparse: true });

export const NotificationModel = model<NotificationAttrs>('Notification', notificationSchema);
