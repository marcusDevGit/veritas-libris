import type {
  AdminUsersQuery,
  AuditLogDto,
  InviteUserBody,
  PaginatedUsers,
  RoleStats,
  UserDto,
  UserRole,
} from '@app/shared';
import { env } from '../config/env.js';
import { getFirebaseAuth } from '../config/firebase.js';
import { AppError, NotFoundError } from '../errors/app-error.js';
import { AuditLogModel, type AuditLogAttrs } from '../models/AuditLog.model.js';
import { UserModel, type UserAttrs } from '../models/User.model.js';
import { canDemoteAdmin, resolveEffectiveRole } from './rbac.utils.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toUserDto(doc: UserAttrs): UserDto {
  return {
    uid: doc.uid,
    email: doc.email ?? null,
    name: doc.name,
    photoUrl: doc.photoUrl ?? null,
    role: doc.role,
    isFounder: Boolean(doc.isFounder),
    title: doc.title ?? null,
    lastSeenAt: doc.lastSeenAt ? doc.lastSeenAt.toISOString() : null,
    updatedByEmail: doc.updatedByEmail ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toAuditLogDto(doc: AuditLogAttrs & { _id: unknown }): AuditLogDto {
  return {
    id: String(doc._id),
    action: doc.action,
    actorUid: doc.actorUid,
    actorName: doc.actorName,
    targetId: doc.targetId,
    targetLabel: doc.targetLabel,
    details: doc.details,
    createdAt: doc.createdAt.toISOString(),
  };
}

export interface SyncAuthInput {
  uid: string;
  email: string | null;
  name: string;
  photoUrl?: string | null;
  claimCurator?: boolean;
  claimAdmin?: boolean;
}

/**
 * Sincroniza o usuário autenticado no MongoDB e resolve seu papel efetivo.
 * Garante bootstrap de ADMIN para e-mails listados em ADMIN_EMAILS.
 */
export async function syncUserFromAuth(input: SyncAuthInput): Promise<UserDto> {
  const normalizedEmail = input.email ? input.email.trim().toLowerCase() : null;
  let existing = await UserModel.findOne({ uid: input.uid }).lean<UserAttrs | null>();

  // Se foi pré-cadastrado/convidado por e-mail antes do 1º login, vincula ao UID real
  if (!existing && normalizedEmail) {
    const invited = await UserModel.findOne({
      email: normalizedEmail,
      uid: `pending:${normalizedEmail}`,
    }).lean<UserAttrs | null>();

    if (invited) {
      existing = await UserModel.findOneAndUpdate(
        { uid: invited.uid },
        { $set: { uid: input.uid } },
        { new: true },
      ).lean<UserAttrs | null>();
    }
  }

  const isFounder = Boolean(normalizedEmail && env.ADMIN_EMAILS.includes(normalizedEmail));

  const effectiveRole = resolveEffectiveRole({
    email: normalizedEmail,
    adminEmails: env.ADMIN_EMAILS,
    storedRole: existing?.role ?? null,
    claimCurator: input.claimCurator,
    claimAdmin: input.claimAdmin,
  });

  const updated = await UserModel.findOneAndUpdate(
    { uid: input.uid },
    {
      $set: {
        email: normalizedEmail,
        name: input.name,
        photoUrl: input.photoUrl ?? existing?.photoUrl ?? null,
        role: effectiveRole,
        isFounder: isFounder || Boolean(existing?.isFounder),
        title: existing?.title ?? (isFounder ? 'Membro Fundador & TI Canônica' : null),
        lastSeenAt: new Date(),
      },
      $setOnInsert: {
        uid: input.uid,
      },
    },
    { upsert: true, new: true },
  ).lean<UserAttrs>();

  return toUserDto(updated);
}

export async function getRoleStats(): Promise<RoleStats> {
  const grouped = await UserModel.aggregate<{ _id: UserRole; count: number }>([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  let admins = 0;
  let curators = 0;
  let readers = 0;

  for (const item of grouped) {
    if (item._id === 'ADMIN') admins = item.count;
    else if (item._id === 'CURATOR') curators = item.count;
    else if (item._id === 'READER') readers = item.count;
  }

  return {
    total: admins + curators + readers,
    admins,
    curators,
    readers,
  };
}

export async function listUsers(query: AdminUsersQuery): Promise<PaginatedUsers> {
  const filter: Record<string, unknown> = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.q && query.q.trim().length > 0) {
    const regex = new RegExp(escapeRegex(query.q.trim()), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { uid: regex }];
  }

  const skip = (query.page - 1) * query.limit;
  const sortOrder: Record<string, 1 | -1> =
    query.sort === 'name'
      ? { name: 1 }
      : query.sort === 'role'
        ? { role: 1, name: 1 }
        : { lastSeenAt: -1, updatedAt: -1 };

  const [docs, total, stats] = await Promise.all([
    UserModel.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(query.limit)
      .lean<UserAttrs[]>(),
    UserModel.countDocuments(filter),
    getRoleStats(),
  ]);

  return {
    items: docs.map(toUserDto),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    stats,
  };
}

export async function updateUserRole(options: {
  targetUid: string;
  nextRole: UserRole;
  actor: { uid: string; name: string; email: string | null };
}): Promise<UserDto> {
  const target = await UserModel.findOne({ uid: options.targetUid }).lean<UserAttrs | null>();
  if (!target) {
    throw new NotFoundError('Usuário não encontrado na base do Veritas Libris');
  }

  if (options.targetUid === options.actor.uid && options.nextRole !== 'ADMIN') {
    throw new AppError(
      400,
      'Você não pode remover seu próprio cargo de administrador.',
      'SELF_DEMOTION_FORBIDDEN',
    );
  }

  if (target.isFounder && options.nextRole !== 'ADMIN') {
    throw new AppError(
      400,
      'Contas fundadoras (ADMIN_EMAILS) são protegidas e não podem ser rebaixadas pela interface.',
      'FOUNDER_PROTECTED',
    );
  }

  const activeAdminCount = await UserModel.countDocuments({ role: 'ADMIN' });
  if (!canDemoteAdmin(target.role, options.nextRole, activeAdminCount)) {
    throw new AppError(
      400,
      'Não é possível remover o último administrador ativo do sistema.',
      'LAST_ADMIN_PROTECTED',
    );
  }

  const previousRole = target.role;
  const updated = await UserModel.findOneAndUpdate(
    { uid: options.targetUid },
    {
      $set: {
        role: options.nextRole,
        updatedByUid: options.actor.uid,
        updatedByEmail: options.actor.email ?? options.actor.name,
      },
    },
    { new: true },
  ).lean<UserAttrs>();

  if (!updated) {
    throw new NotFoundError('Usuário não encontrado');
  }

  // Espelha as permissões no Firebase Custom Claims (melhor esforço para compatibilidade JWT)
  try {
    await getFirebaseAuth().setCustomUserClaims(options.targetUid, {
      role: options.nextRole,
      curator: options.nextRole === 'CURATOR' || options.nextRole === 'ADMIN',
      admin: options.nextRole === 'ADMIN',
    });
  } catch {
    // Não falha a operação caso o ambiente de teste/local não tenha o usuário no Firebase
  }

  if (previousRole !== options.nextRole) {
    await AuditLogModel.create({
      action: 'ROLE_UPDATED',
      actorUid: options.actor.uid,
      actorName: options.actor.name,
      targetId: updated.uid,
      targetLabel: updated.email ? `${updated.name} (${updated.email})` : updated.name,
      details: `Alterou cargo de ${previousRole} para ${options.nextRole}`,
    });
  }

  return toUserDto(updated);
}

export async function inviteOrPromoteUser(options: {
  payload: InviteUserBody;
  actor: { uid: string; name: string; email: string | null };
}): Promise<UserDto> {
  const { name, email, role, title } = options.payload;
  const existing = await UserModel.findOne({ email }).lean<UserAttrs | null>();

  if (existing) {
    const activeAdminCount = await UserModel.countDocuments({ role: 'ADMIN' });
    if (!canDemoteAdmin(existing.role, role, activeAdminCount)) {
      throw new AppError(
        400,
        'Não é possível remover o último administrador ativo do sistema.',
        'LAST_ADMIN_PROTECTED',
      );
    }

    const updated = await UserModel.findOneAndUpdate(
      { uid: existing.uid },
      {
        $set: {
          role,
          ...(title ? { title } : {}),
          updatedByUid: options.actor.uid,
          updatedByEmail: options.actor.email ?? options.actor.name,
        },
      },
      { new: true },
    ).lean<UserAttrs>();

    if (!updated) {
      throw new NotFoundError('Usuário não encontrado');
    }

    try {
      await getFirebaseAuth().setCustomUserClaims(updated.uid, {
        role,
        curator: role === 'CURATOR' || role === 'ADMIN',
        admin: role === 'ADMIN',
      });
    } catch {
      // Melhor esforço
    }

    await AuditLogModel.create({
      action: 'ROLE_UPDATED',
      actorUid: options.actor.uid,
      actorName: options.actor.name,
      targetId: updated.uid,
      targetLabel: `${updated.name} (${email})`,
      details: `Nomeou/atualizou cargo para ${role}`,
    });

    return toUserDto(updated);
  }

  const created = await UserModel.create({
    uid: `pending:${email}`,
    email,
    name,
    role,
    isFounder: false,
    title: title ?? null,
    lastSeenAt: null,
    updatedByUid: options.actor.uid,
    updatedByEmail: options.actor.email ?? options.actor.name,
  });

  await AuditLogModel.create({
    action: 'ROLE_UPDATED',
    actorUid: options.actor.uid,
    actorName: options.actor.name,
    targetId: created.uid,
    targetLabel: `${name} (${email})`,
    details: `Convidou e pré-nomeou como ${role}`,
  });

  return toUserDto(created.toObject());
}

export async function listRecentAuditLogs(limit = 20): Promise<AuditLogDto[]> {
  const docs = await AuditLogModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<Array<AuditLogAttrs & { _id: unknown }>>();

  return docs.map(toAuditLogDto);
}
