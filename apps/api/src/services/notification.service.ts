import { Types } from 'mongoose';
import type { NotificationDto, NotificationListResponse, NotificationType } from '@app/shared';
import { NotificationModel, type NotificationAttrs } from '../models/Notification.model.js';
import { ReadingListItemModel } from '../models/ReadingListItem.model.js';
import { buildNotificationPayloads } from './notification.utils.js';

function toNotificationDto(doc: NotificationAttrs & { _id: unknown }): NotificationDto {
  return {
    id: String(doc._id),
    bookId: doc.bookId.toString(),
    bookTitle: doc.bookTitle,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    read: doc.read,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function notifyReadingListWatchers(options: {
  bookId: Types.ObjectId | string;
  bookTitle: string;
  type: NotificationType;
  actorUid?: string;
  actorName: string;
  summaryDetail?: string;
}): Promise<void> {
  const bookObjectId =
    typeof options.bookId === 'string' ? new Types.ObjectId(options.bookId) : options.bookId;

  const watchers = await ReadingListItemModel.find(
    { bookId: bookObjectId },
    { userId: 1 },
  ).lean<{ userId: string }[]>();

  const payloads = buildNotificationPayloads({
    bookTitle: options.bookTitle,
    type: options.type,
    actorUid: options.actorUid,
    actorName: options.actorName,
    recipientUserIds: watchers.map((w) => w.userId),
    summaryDetail: options.summaryDetail,
  });

  if (payloads.length === 0) return;

  await NotificationModel.insertMany(
    payloads.map((p) => ({
      ...p,
      bookId: bookObjectId,
      read: false,
    })),
  );
}

export async function listUserNotifications(
  userId: string,
  limit = 20,
): Promise<NotificationListResponse> {
  const [docs, unreadCount] = await Promise.all([
    NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<Array<NotificationAttrs & { _id: unknown }>>(),
    NotificationModel.countDocuments({ userId, read: false }),
  ]);

  return {
    items: docs.map(toNotificationDto),
    unreadCount,
  };
}

export async function markAllNotificationsAsRead(userId: string): Promise<{ updated: number }> {
  const result = await NotificationModel.updateMany(
    { userId, read: false },
    { $set: { read: true } },
  );
  return { updated: result.modifiedCount };
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
): Promise<{ read: boolean }> {
  await NotificationModel.updateOne(
    { _id: new Types.ObjectId(notificationId), userId },
    { $set: { read: true } },
  );
  return { read: true };
}
