import { model, Schema, type Types } from 'mongoose';
import { NOTIFICATION_TYPES, type NotificationType } from '@app/shared';

export interface NotificationAttrs {
  userId: string;
  bookId: Types.ObjectId;
  bookTitle: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationAttrs>(
  {
    userId: { type: String, required: true, trim: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    bookTitle: { type: String, required: true, trim: true },
    type: { type: String, enum: [...NOTIFICATION_TYPES], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = model<NotificationAttrs>('Notification', notificationSchema);
