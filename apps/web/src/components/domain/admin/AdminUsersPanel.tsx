import React from 'react';
import type { AdminUsersSort, RoleStats, UserDto, UserRole } from '@app/shared';
import { Lock, Search, Shield, Feather, User as UserIcon, ChevronDown } from 'lucide-react';

export type RoleFilter = 'ALL' | UserRole;

interface AdminUsersPanelProps {
  users: UserDto[];
  total: number;
  stats: RoleStats;
  currentUserUid?: string;
  searchTerm: string;
  roleFilter: RoleFilter;
  sortBy: AdminUsersSort;
  isLoading: boolean;
  isUpdating: boolean;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: RoleFilter) => void;
  onSortChange: (value: AdminUsersSort) => void;
  onUpdateRole: (uid: string, role: UserRole) => void;
}

const ROLE_META: Record<
  UserRole,
  { label: string; subtitle: string; badgeClass: string; icon: React.ReactNode }
> = {
  ADMIN: {
    label: 'Administrador',
    subtitle: 'Governança RBAC & Curadoria',
    badgeClass: 'bg-primary-container text-on-primary border-primary',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  CURATOR: {
    label: 'Curador Oficial',
    subtitle: 'Faculdade de Trava Editorial (editorialLock)',
    badgeClass: 'bg-secondary-container/70 text-on-secondary-container border-secondary/30',
    icon: <Feather className="w-3.5 h-3.5" />,
  },
  READER: {
    label: 'Leitor',
    subtitle: 'Avaliações comunitárias',
    badgeClass: 'bg-surface-container text-on-surface-variant border-outline/20',
    icon: <UserIcon className="w-3.5 h-3.5" />,
  },
};

function getActivityStatus(item: UserDto, isSelf: boolean) {
  if (item.uid.startsWith('pending:')) {
    return {
      isOnline: false,
      label: 'Convite Pendente',
      dotClass: 'bg-outline',
      badgeClass: 'bg-surface-container text-on-surface-variant',
    };
  }

  const lastSeenMs = item.lastSeenAt ? new Date(item.lastSeenAt).getTime() : 0;
  const diffMinutes = lastSeenMs > 0 ? (Date.now() - lastSeenMs) / 60_000 : Infinity;

  if (isSelf || diffMinutes <= 15) {
    return {
      isOnline: true,
      label: 'Sessão Ativa Agora',
      dotClass: 'bg-emerald-500 animate-pulse',
      badgeClass: 'bg-emerald-50 text-emerald-800',
    };
  }

  if (diffMinutes < 60) {
    return {
      isOnline: false,
      label: `Offline • há ${Math.max(1, Math.floor(diffMinutes))} min`,
      dotClass: 'bg-outline/60',
      badgeClass: 'text-on-surface-variant',
    };
  }

  if (diffMinutes < 60 * 24) {
    return {
      isOnline: false,
      label: `Offline • há ${Math.floor(diffMinutes / 60)}h`,
      dotClass: 'bg-outline/60',
      badgeClass: 'text-on-surface-variant',
    };
  }

  return {
    isOnline: false,
    label: 'Fora de sessão',
    dotClass: 'bg-outline/50',
    badgeClass: 'text-on-surface-variant',
  };
}

export const AdminUsersPanel: React.FC<AdminUsersPanelProps> = ({
  users,
  total,
  stats,
  currentUserUid,
  searchTerm,
  roleFilter,
  sortBy,
  isLoading,
  isUpdating,
  onSearchChange,
  onRoleFilterChange,
  onSortChange,
  onUpdateRole,
}) => {
  const isProtectedAccount = (item: UserDto, isSelf: boolean) =>
    item.role === 'ADMIN' && (item.isFounder || isSelf || stats.admins <= 1);

  const filterChips: Array<{ value: RoleFilter; label: string; count: number }> = [
    { value: 'ALL', label: 'Todos', count: stats.total },
    { value: 'ADMIN', label: 'Administradores', count: stats.admins },
    { value: 'CURATOR', label: 'Curadores', count: stats.curators },
    { value: 'READER', label: 'Leitores', count: stats.readers },
  ];

  return (
    <section className="bg-surface-container-lowest border border-outline/15 rounded-xl shadow-xs overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 bg-surface-container-low flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 border-b border-outline/10">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar usuário por nome ou e-mail..."
            className="w-full h-10 bg-surface-container-lowest text-on-surface text-sm pl-10 pr-4 rounded-lg border border-outline/20 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-outline transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center bg-surface-container-highest/60 p-1 rounded-lg gap-1">
            {filterChips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => onRoleFilterChange(chip.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  roleFilter === chip.value
                    ? 'bg-surface-container-lowest text-primary shadow-2xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {chip.label} ({chip.count})
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              aria-label="Ordenação dos Usuários"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as AdminUsersSort)}
              className="appearance-none h-9 bg-surface-container-lowest text-on-surface border border-outline/20 text-xs font-semibold pl-3 pr-8 rounded-lg outline-none cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <option value="recent">Ordenação: Mais recentes</option>
              <option value="name">Ordenação: Ordem Alfabética</option>
              <option value="role">Ordenação: Por Cargo</option>
            </select>
            <ChevronDown className="w-4 h-4 text-outline absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-on-surface-variant">
          Carregando usuários cadastrados...
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-sm text-on-surface-variant">
          Nenhum usuário encontrado para o filtro selecionado.
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-[11px] tracking-wider uppercase border-b border-outline/15">
                  <th className="py-3.5 px-6 font-bold" scope="col">Usuário</th>
                  <th className="py-3.5 px-4 font-bold" scope="col">Cargo &amp; Credencial</th>
                  <th className="py-3.5 px-4 font-bold" scope="col">Status de Atuação</th>
                  <th className="py-3.5 px-4 font-bold" scope="col">Nomeado Por / Alteração</th>
                  <th className="py-3.5 px-6 text-right font-bold" scope="col">Ações de Governança</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface divide-y divide-outline/10">
                {users.map((item) => {
                  const meta = ROLE_META[item.role];
                  const isSelf = item.uid === currentUserUid;
                  const locked = isProtectedAccount(item, isSelf);
                  const activity = getActivityStatus(item, isSelf);
                  const roleTitle =
                    item.isFounder && item.role === 'ADMIN' ? 'Superadministrador' : meta.label;
                  const roleSubtitle =
                    item.title ||
                    (item.isFounder && item.role === 'ADMIN'
                      ? 'Membro Fundador & TI Canônica'
                      : meta.subtitle);

                  return (
                    <tr
                      key={item.uid}
                      className={`hover:bg-surface-container-low/50 transition-colors ${
                        item.role === 'ADMIN' ? 'bg-primary/[0.03]' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-full object-cover ring-1 ring-outline/20 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {item.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-primary truncate">{item.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-[9px] font-bold uppercase">
                                  Você
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-on-surface-variant truncate">
                              {item.email ?? item.uid}
                            </p>
                            <p className="text-[11px] text-outline mt-0.5">
                              {item.reviewsCount ?? 0}{' '}
                              {(item.reviewsCount ?? 0) === 1 ? 'parecer' : 'pareceres'} •{' '}
                              {item.helpfulVotesReceived ?? 0}{' '}
                              {(item.helpfulVotesReceived ?? 0) === 1 ? 'voto útil' : 'votos úteis'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] font-bold uppercase ${meta.badgeClass}`}
                          >
                            {meta.icon}
                            {roleTitle}
                          </span>
                          <span className="text-[11px] text-on-surface-variant font-medium">
                            {roleSubtitle}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${activity.dotClass}`} />
                          {activity.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs text-on-surface-variant">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">
                            {item.updatedByEmail
                              ? item.updatedByEmail
                              : item.isFounder
                                ? 'Criação do Sistema'
                                : 'Cadastro inicial'}
                          </span>
                          <span>{new Date(item.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {locked ? (
                          <span
                            title="Conta fundadora ou sua própria credencial de administrador está protegida contra rebaixamento."
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-semibold opacity-80 cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            {item.isFounder ? 'Protegido — Conta Fundadora' : isSelf ? 'Protegido — Sua Conta' : 'Protegido — Último Admin'}
                          </span>
                        ) : (
                          <select
                            aria-label={`Cargo de ${item.name}`}
                            value={item.role}
                            disabled={isUpdating}
                            onChange={(e) => onUpdateRole(item.uid, e.target.value as UserRole)}
                            className="h-9 px-3 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high border border-outline/20 text-xs font-semibold outline-none focus:border-primary cursor-pointer transition-colors"
                          >
                            <option value="READER">Leitor</option>
                            <option value="CURATOR">Curador Oficial</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-outline/10">
            {users.map((item) => {
              const meta = ROLE_META[item.role];
              const isSelf = item.uid === currentUserUid;
              const locked = isProtectedAccount(item, isSelf);
              const activity = getActivityStatus(item, isSelf);
              const roleTitle =
                item.isFounder && item.role === 'ADMIN' ? 'Superadministrador' : meta.label;

              return (
                <div key={item.uid} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-outline/20 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-primary truncate">{item.name}</p>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-[9px] font-bold uppercase">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant truncate">
                          {item.email ?? item.uid}
                        </p>
                        <p className="text-[11px] text-outline mt-0.5">
                          {item.reviewsCount ?? 0}{' '}
                          {(item.reviewsCount ?? 0) === 1 ? 'parecer' : 'pareceres'} •{' '}
                          {item.helpfulVotesReceived ?? 0}{' '}
                          {(item.helpfulVotesReceived ?? 0) === 1 ? 'voto útil' : 'votos úteis'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${meta.badgeClass}`}
                    >
                      {roleTitle}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${activity.badgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${activity.dotClass}`} />
                      {activity.label}
                    </span>
                    <span className="text-on-surface-variant">
                      {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {locked ? (
                    <div className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      {item.isFounder ? 'Protegido — Conta Fundadora' : isSelf ? 'Protegido — Sua Conta' : 'Protegido — Último Admin'}
                    </div>
                  ) : (
                    <select
                      aria-label={`Cargo de ${item.name}`}
                      value={item.role}
                      disabled={isUpdating}
                      onChange={(e) => onUpdateRole(item.uid, e.target.value as UserRole)}
                      className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-outline/25 text-xs font-semibold text-primary"
                    >
                      <option value="READER">Leitor</option>
                      <option value="CURATOR">Curador Oficial</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <footer className="px-5 py-3.5 bg-surface-container-low border-t border-outline/10 flex items-center justify-between text-xs text-on-surface-variant">
        <span>
          Exibindo <strong className="text-primary">{users.length}</strong> de{' '}
          <strong className="text-primary">{total}</strong> usuários filtrados
        </span>
      </footer>
    </section>
  );
};
