import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  AdminUsersQuerySchema,
  AuditLogListResponseSchema,
  InviteUserBodySchema,
  PaginatedUsersSchema,
  UpdateUserRoleBodySchema,
  UserDtoSchema,
  UserUidParamsSchema,
} from '@app/shared';
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';
import {
  inviteOrPromoteUser,
  listRecentAuditLogs,
  listUsers,
  updateUserRole,
} from '../services/user.service.js';

export const adminRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/admin/users',
    {
      preHandler: [requireAuth, requireAdmin],
      schema: {
        querystring: AdminUsersQuerySchema,
        response: { 200: PaginatedUsersSchema },
      },
    },
    async (request) => listUsers(request.query),
  );

  app.patch(
    '/admin/users/:uid/role',
    {
      preHandler: [requireAuth, requireAdmin],
      schema: {
        params: UserUidParamsSchema,
        body: UpdateUserRoleBodySchema,
        response: { 200: UserDtoSchema },
      },
    },
    async (request) =>
      updateUserRole({
        targetUid: request.params.uid,
        nextRole: request.body.role,
        actor: {
          uid: request.authUser!.uid,
          name: request.authUser!.name,
          email: request.authUser!.email,
        },
      }),
  );

  app.post(
    '/admin/users/invite',
    {
      preHandler: [requireAuth, requireAdmin],
      schema: {
        body: InviteUserBodySchema,
        response: { 200: UserDtoSchema },
      },
    },
    async (request) =>
      inviteOrPromoteUser({
        payload: request.body,
        actor: {
          uid: request.authUser!.uid,
          name: request.authUser!.name,
          email: request.authUser!.email,
        },
      }),
  );

  app.get(
    '/admin/audit-logs',
    {
      preHandler: [requireAuth, requireAdmin],
      schema: {
        response: { 200: AuditLogListResponseSchema },
      },
    },
    async () => ({ items: await listRecentAuditLogs() }),
  );
};
