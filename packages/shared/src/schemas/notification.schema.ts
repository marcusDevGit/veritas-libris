import { z } from 'zod';

export const NOTIFICATION_TYPES = ['NEW_REVIEW', 'EDITORIAL_UPDATE'] as const;
export const NotificationTypeSchema = z.enum(NOTIFICATION_TYPES);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationDtoSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  bookTitle: z.string(),
  type: NotificationTypeSchema,
  title: z.string(),
  description: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});
export type NotificationDto = z.infer<typeof NotificationDtoSchema>;

export const NotificationListResponseSchema = z.object({
  items: z.array(NotificationDtoSchema),
  unreadCount: z.number().int().nonnegative(),
});
export type NotificationListResponse = z.infer<typeof NotificationListResponseSchema>;

export const ArchiveNotificationsResponseSchema = z.object({
  archived: z.number().int().nonnegative(),
});
export type ArchiveNotificationsResponse = z.infer<typeof ArchiveNotificationsResponseSchema>;
