import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  ArchiveNotificationsResponseSchema,
  BookIdParamsSchema,
  NotificationListResponseSchema,
} from '@app/shared';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  archiveNotification,
  archiveReadNotifications,
  listUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notification.service.js';

export const notificationRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/notifications',
    {
      preHandler: [requireAuth],
      schema: {
        response: { 200: NotificationListResponseSchema },
      },
    },
    async (request) => listUserNotifications(request.authUser!.uid),
  );

  app.patch(
    '/notifications/read-all',
    {
      preHandler: [requireAuth],
      schema: {
        response: { 200: z.object({ updated: z.number().int().nonnegative() }) },
      },
    },
    async (request) => markAllNotificationsAsRead(request.authUser!.uid),
  );

  app.patch(
    '/notifications/:id/read',
    {
      preHandler: [requireAuth],
      schema: {
        params: BookIdParamsSchema,
        response: { 200: z.object({ read: z.boolean() }) },
      },
    },
    async (request) => markNotificationAsRead(request.authUser!.uid, request.params.id),
  );

  app.delete(
    '/notifications/read',
    {
      preHandler: [requireAuth],
      schema: {
        response: { 200: ArchiveNotificationsResponseSchema },
      },
    },
    async (request) => archiveReadNotifications(request.authUser!.uid),
  );

  app.delete(
    '/notifications/:id',
    {
      preHandler: [requireAuth],
      schema: {
        params: BookIdParamsSchema,
        response: { 200: ArchiveNotificationsResponseSchema },
      },
    },
    async (request) => archiveNotification(request.authUser!.uid, request.params.id),
  );
};
