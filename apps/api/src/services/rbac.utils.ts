import type { UserRole } from '@app/shared';

export function isCuratorRole(role: UserRole): boolean {
  return role === 'CURATOR' || role === 'ADMIN';
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Resolve o papel inicial ou efetivo ao autenticar via Firebase.
 * Se o e-mail estiver em ADMIN_EMAILS, sempre garante ADMIN.
 */
export function resolveEffectiveRole(options: {
  email: string | null;
  adminEmails: string[];
  storedRole?: UserRole | null;
  claimCurator?: boolean;
  claimAdmin?: boolean;
}): UserRole {
  const normalizedEmail = options.email?.trim().toLowerCase();
  if (normalizedEmail && options.adminEmails.includes(normalizedEmail)) {
    return 'ADMIN';
  }

  if (options.storedRole) {
    return options.storedRole;
  }

  if (options.claimAdmin) {
    return 'ADMIN';
  }

  if (options.claimCurator) {
    return 'CURATOR';
  }

  return 'READER';
}

/**
 * Impede remover o último administrador ativo do sistema.
 */
export function canDemoteAdmin(currentRole: UserRole, nextRole: UserRole, activeAdminCount: number): boolean {
  if (currentRole === 'ADMIN' && nextRole !== 'ADMIN' && activeAdminCount <= 1) {
    return false;
  }
  return true;
}
