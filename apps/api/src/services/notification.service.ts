import { Types } from 'mongoose';
import type {
  ArchiveNotificationsResponse,
  NotificationDto,
  NotificationListResponse,
  NotificationType,
  UserRole,
} from '@app/shared';
import { NotificationModel, type NotificationAttrs } from '../models/Notification.model.js';
import { ReadingListItemModel } from '../models/ReadingListItem.model.js';
import { buildNotificationPayloads, buildReviewHelpfulDedupKey } from './notification.utils.js';

function toNotificationDto(doc: NotificationAttrs & { _id: unknown }): NotificationDto {
  return {
    id: String(doc._id),
    bookId: doc.bookId ? doc.bookId.toString() : undefined,
    bookTitle: doc.bookTitle ?? undefined,
    link: doc.link ?? undefined,
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

export async function notifyReviewHelpful(options: {
  reviewId: string;
  bookId: Types.ObjectId | string;
  bookTitle: string;
  authorUid: string;
  voterUid: string;
  helpfulVotes: number;
}): Promise<void> {
  if (!options.authorUid || options.authorUid === options.voterUid) {
    return;
  }

  const dedupKey = buildReviewHelpfulDedupKey(options.reviewId, options.voterUid);
  const alreadyNotified = await NotificationModel.exists({
    userId: options.authorUid,
    dedupKey,
  });
  if (alreadyNotified) {
    return;
  }

  const bookObjectId =
    typeof options.bookId === 'string' ? new Types.ObjectId(options.bookId) : options.bookId;

  await NotificationModel.create({
    userId: options.authorUid,
    bookId: bookObjectId,
    bookTitle: options.bookTitle,
    link: `/livros/${bookObjectId.toString()}`,
    dedupKey,
    type: 'REVIEW_HELPFUL',
    title: `Seu parecer em "${options.bookTitle}" foi marcado como útil`,
    description: `Sua avaliação recebeu um voto útil e agora soma ${options.helpfulVotes} ${
      options.helpfulVotes === 1 ? 'voto útil' : 'votos úteis'
    }.`,
    read: false,
  });
}

export async function notifyRoleUpdated(options: {
  targetUid: string;
  nextRole: UserRole;
  actorName: string;
}): Promise<void> {
  if (options.nextRole !== 'CURATOR' && options.nextRole !== 'ADMIN') {
    return;
  }

  const roleLabel = options.nextRole === 'ADMIN' ? 'Administrador' : 'Curador Oficial';
  await NotificationModel.create({
    userId: options.targetUid,
    link: '/curadoria',
    type: 'ROLE_UPDATED',
    title: `Você foi promovido a ${roleLabel}`,
    description: `${options.actorName} habilitou seu acesso como ${roleLabel}. O Painel de Curadoria (/curadoria) já está disponível para você.`,
    read: false,
  });
}

export async function listUserNotifications(
  userId: string,
  limit = 20,
): Promise<NotificationListResponse> {
  const activeFilter = { userId, archived: { $ne: true } };
  const [docs, unreadCount] = await Promise.all([
    NotificationModel.find(activeFilter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<Array<NotificationAttrs & { _id: unknown }>>(),
    NotificationModel.countDocuments({ ...activeFilter, read: false }),
  ]);

  return {
    items: docs.map(toNotificationDto),
    unreadCount,
  };
}

export async function markAllNotificationsAsRead(userId: string): Promise<{ updated: number }> {
  const result = await NotificationModel.updateMany(
    { userId, read: false, archived: { $ne: true } },
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

export async function archiveReadNotifications(
  userId: string,
): Promise<ArchiveNotificationsResponse> {
  const result = await NotificationModel.updateMany(
    { userId, read: true, archived: { $ne: true } },
    { $set: { archived: true } },
  );
  return { archived: result.modifiedCount };
}

export async function archiveNotification(
  userId: string,
  notificationId: string,
): Promise<ArchiveNotificationsResponse> {
  const result = await NotificationModel.updateOne(
    { _id: new Types.ObjectId(notificationId), userId, archived: { $ne: true } },
    { $set: { read: true, archived: true } },
  );
  return { archived: result.modifiedCount };
}
