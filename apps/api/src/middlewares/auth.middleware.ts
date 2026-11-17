import type { FastifyRequest } from 'fastify';
import { getFirebaseAuth } from '../config/firebase.js';
import { UnauthorizedError } from '../errors/app-error.js';

export interface AuthUser {
  uid: string;
  name: string;
  email: string | null;
  /** Vem de um custom claim ({ curator: true }) definido via Firebase Admin; o cliente não consegue forjá-lo. */
  isCurator: boolean;
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser: AuthUser | null;
  }
}

/**
 * preHandler que exige "Authorization: Bearer <Firebase ID Token>".
 * O token é verificado no servidor (assinatura, expiração e projeto) pelo Firebase Admin.
 * Uso:  app.post('/rota', { preHandler: requireAuth }, handler)
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

    request.authUser = {
      uid: decoded.uid,
      name: typeof decoded.name === 'string' && decoded.name.length > 0 ? decoded.name : 'Usuário',
      email: decoded.email ?? null,
      isCurator: decoded['curator'] === true,
    };
  } catch (error) {
    request.log.warn({ err: error }, 'Falha ao verificar token do Firebase');
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}
