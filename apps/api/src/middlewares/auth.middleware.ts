import type { FastifyRequest } from 'fastify';
import type { UserRole } from '@app/shared';
import { getFirebaseAuth } from '../config/firebase.js';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';
import { isAdminRole, isCuratorRole } from '../services/rbac.utils.js';
import { syncUserFromAuth } from '../services/user.service.js';

export interface AuthUser {
  uid: string;
  name: string;
  email: string | null;
  photoUrl: string | null;
  role: UserRole;
  /** Verdadeiro para CURATOR e ADMIN (ADMIN herda permissões de curadoria). */
  isCurator: boolean;
  isAdmin: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser: AuthUser | null;
  }
}

/**
 * preHandler que exige "Authorization: Bearer <Firebase ID Token>".
 * O token é verificado no servidor pelo Firebase Admin e sincronizado com o RBAC do MongoDB.
 */
export async function requireAuth(request: FastifyRequest): Promise<void> {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de autenticação ausente');
  }

  const token = header.slice('Bearer '.length).trim();
  if (token.length === 0) {
    throw new UnauthorizedError('Token de autenticação ausente');
  }

  try {
    const decoded = await getFirebaseAuth().verifyIdToken(token);
    const name = typeof decoded.name === 'string' && decoded.name.length > 0 ? decoded.name : 'Usuário';
    const email = decoded.email ?? null;
    const photoUrl = typeof decoded.picture === 'string' ? decoded.picture : null;

    const synced = await syncUserFromAuth({
      uid: decoded.uid,
      email,
      name,
      photoUrl,
      claimCurator: decoded['curator'] === true,
      claimAdmin: decoded['admin'] === true,
    });

    request.authUser = {
      uid: synced.uid,
      name: synced.name,
      email: synced.email,
      photoUrl: synced.photoUrl ?? photoUrl,
      role: synced.role,
      isCurator: isCuratorRole(synced.role),
      isAdmin: isAdminRole(synced.role),
    };
  } catch (error) {
    request.log.warn({ err: error }, 'Falha ao verificar token do Firebase');
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}

/** Exige papel CURATOR ou ADMIN (deve ser usado após requireAuth). */
export async function requireCurator(request: FastifyRequest): Promise<void> {
  if (!request.authUser) {
    throw new UnauthorizedError('Autenticação necessária');
  }
  if (!request.authUser.isCurator) {
    throw new ForbiddenError('Acesso restrito a curadores e administradores');
  }
}

/** Exige papel ADMIN (deve ser usado após requireAuth). */
export async function requireAdmin(request: FastifyRequest): Promise<void> {
  if (!request.authUser) {
    throw new UnauthorizedError('Autenticação necessária');
  }
  if (!request.authUser.isAdmin) {
    throw new ForbiddenError('Acesso restrito a administradores');
  }
}
