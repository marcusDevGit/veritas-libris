import { z } from 'zod';

export const USER_ROLES = ['READER', 'CURATOR', 'ADMIN'] as const;
export const UserRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserDtoSchema = z.object({
  uid: z.string(),
  email: z.string().nullable(),
  name: z.string(),
  photoUrl: z.string().nullable().optional(),
  role: UserRoleSchema,
  isFounder: z.boolean().default(false),
  title: z.string().nullable().optional(),
  lastSeenAt: z.string().nullable().optional(),
  updatedByEmail: z.string().nullable().optional(),
  reviewsCount: z.number().int().nonnegative().default(0),
  helpfulVotesReceived: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserDto = z.infer<typeof UserDtoSchema>;

export const RoleStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  admins: z.number().int().nonnegative(),
  curators: z.number().int().nonnegative(),
  readers: z.number().int().nonnegative(),
});
export type RoleStats = z.infer<typeof RoleStatsSchema>;

export const AdminUsersSortSchema = z.enum(['recent', 'name', 'role']);
export type AdminUsersSort = z.infer<typeof AdminUsersSortSchema>;

export const AdminUsersQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  role: UserRoleSchema.optional(),
  sort: AdminUsersSortSchema.default('recent'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type AdminUsersQuery = z.infer<typeof AdminUsersQuerySchema>;

export const PaginatedUsersSchema = z.object({
  items: z.array(UserDtoSchema),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  stats: RoleStatsSchema,
});
export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;

export const UserUidParamsSchema = z.object({
  uid: z.string().trim().min(1, 'UID do usuário é obrigatório'),
});

export const UpdateUserRoleBodySchema = z.object({
  role: UserRoleSchema,
});
export type UpdateUserRoleBody = z.infer<typeof UpdateUserRoleBodySchema>;

export const InviteUserBodySchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome completo').max(120),
  email: z.email('Informe um e-mail válido').transform((v) => v.trim().toLowerCase()),
  role: UserRoleSchema,
  title: z.string().trim().max(120).optional(),
});
export type InviteUserBody = z.infer<typeof InviteUserBodySchema>;

export const AuditLogDtoSchema = z.object({
  id: z.string(),
  action: z.enum([
    'ROLE_UPDATED',
    'EDITORIAL_LOCK_UPDATED',
    'SUGGESTION_TRIAGED',
    'REVIEW_MODERATED',
    'AI_DRAFT_GENERATED',
  ]),
  actorUid: z.string(),
  actorName: z.string(),
  targetId: z.string(),
  targetLabel: z.string(),
  details: z.string(),
  createdAt: z.string(),
});
export type AuditLogDto = z.infer<typeof AuditLogDtoSchema>;

export const AuditLogListResponseSchema = z.object({
  items: z.array(AuditLogDtoSchema),
});
export type AuditLogListResponse = z.infer<typeof AuditLogListResponseSchema>;
