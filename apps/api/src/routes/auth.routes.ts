import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UserDtoSchema } from '@app/shared';
import { UnauthorizedError } from '../errors/app-error.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { syncUserFromAuth } from '../services/user.service.js';

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/auth/me',
    {
      preHandler: [requireAuth],
      schema: {
        response: { 200: UserDtoSchema },
      },
    },
    async (request) => {
      if (!request.authUser) {
        throw new UnauthorizedError();
      }
      return syncUserFromAuth({
        uid: request.authUser.uid,
        email: request.authUser.email,
        name: request.authUser.name,
        photoUrl: request.authUser.photoUrl,
      });
    },
  );
};
