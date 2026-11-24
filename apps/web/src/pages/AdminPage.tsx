import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminUsersSort, InviteUserBody, UserRole } from '@app/shared';
import {
  ShieldCheck,
  Users,
  History,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Home,
  UserPlus,
  Settings2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { api, ApiError } from '../services/api.js';
import { AdminKpiGrid } from '../components/domain/admin/AdminKpiGrid.js';
import { AdminUsersPanel, type RoleFilter } from '../components/domain/admin/AdminUsersPanel.js';
import { AdminAuditTimeline } from '../components/domain/admin/AdminAuditTimeline.js';
import { AdminSecuritySettingsPanel } from '../components/domain/admin/AdminSecuritySettingsPanel.js';
import { InviteCuratorModal } from '../components/domain/admin/InviteCuratorModal.js';

type TabKey = 'users' | 'audit' | 'security';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  CURATOR: 'Curador Oficial',
  READER: 'Leitor',
};

export const AdminPage: React.FC = () => {
  const { user, profile, isAdmin, isLoading: authLoading, signInWithGoogle, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [sortBy, setSortBy] = useState<AdminUsersSort>('recent');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter, sortBy],
    queryFn: () =>
      api.listAdminUsers({
        q: searchTerm.trim() || undefined,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        sort: sortBy,
        limit: 50,
      }),
    enabled: Boolean(user && isAdmin),
  });

  const auditQuery = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => api.listAdminAuditLogs(),
    enabled: Boolean(user && isAdmin),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: UserRole }) => api.updateUserRole(uid, role),
    onSuccess: async (updatedUser) => {
      setFeedback({
        type: 'success',
        text: `Cargo de ${updatedUser.name} atualizado para ${ROLE_LABELS[updatedUser.role]}.`,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
        refreshProfile(),
      ]);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível atualizar o cargo do usuário.';
      setFeedback({ type: 'error', text: message });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteUserBody) => api.inviteAdminUser(payload),
    onSuccess: async (invitedUser) => {
      setIsInviteOpen(false);
      setInviteError(null);
      setFeedback({
        type: 'success',
        text: `${invitedUser.name} foi nomeado(a) como ${ROLE_LABELS[invitedUser.role]}.`,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
      ]);
    },
    onError: (err) => {
      setInviteError(
        err instanceof ApiError ? err.message : 'Não foi possível expedir a nomeação.',
      );
    },
  });

  if (authLoading) {
    return (
      <div className="pt-[108px] pb-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-48 rounded-2xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-[108px] pb-16 max-w-xl mx-auto px-4 text-center">
        <div className="bg-surface-container-lowest border border-outline/20 rounded-2xl p-8 shadow-xs">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-editorial text-2xl font-bold text-primary mb-2">
            Área Restrita à Administração
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Faça login com sua conta de administrador para gerenciar o corpo de curadores e permissões.
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-[108px] pb-16 max-w-xl mx-auto px-4 text-center">
        <div className="bg-surface-container-lowest border border-outline/20 rounded-2xl p-8 shadow-xs">
          <Lock className="w-10 h-10 text-error mx-auto mb-3" />
          <h1 className="font-editorial text-2xl font-bold text-primary mb-2">
            Acesso Exclusivo de Administradores
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Sua conta atual não possui permissão administrativa para nomear curadores ou alterar cargos.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const stats = usersQuery.data?.stats ?? { total: 0, admins: 0, curators: 0, readers: 0 };
  const users = usersQuery.data?.items ?? [];
  const auditLogs = auditQuery.data?.items ?? [];

  return (
    <div className="pt-28 sm:pt-[116px] pb-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span>Área Restrita</span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Administração</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="flex flex-col gap-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Administração &amp; Corpo de Curadores
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary-container" />
                {profile?.isFounder ? 'Acesso de Superadministrador' : 'Acesso de Administrador'}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant">
              Nomeação de curadores, governança de permissões (RBAC) e trilha de auditoria do sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setInviteError(null);
              setIsInviteOpen(true);
            }}
            className="self-start lg:self-auto px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs sm:text-sm font-semibold shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-secondary-container" />
            Convidar Novo Curador
          </button>
        </div>
      </header>

      <AdminKpiGrid stats={stats} />

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-success-container/60 border-success/30 text-success'
              : 'bg-error-container/70 border-error/30 text-on-error-container'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      <nav className="flex flex-wrap items-center gap-2 bg-surface-container-high/50 p-1.5 rounded-xl self-start">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-surface-container-lowest text-primary font-bold shadow-2xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Users className="w-4 h-4" />
          Gestão de Curadores &amp; Permissões
          <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[11px] font-bold">
            {stats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-surface-container-lowest text-primary font-bold shadow-2xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <History className="w-4 h-4" />
          Log de Auditoria
          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface text-[11px] font-bold">
            {auditLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-surface-container-lowest text-primary font-bold shadow-2xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Configurações de Segurança Canônica
        </button>
      </nav>

      {activeTab === 'users' && (
        <>
          <AdminUsersPanel
            users={users}
            total={usersQuery.data?.total ?? 0}
            stats={stats}
            currentUserUid={user.uid}
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            sortBy={sortBy}
            isLoading={usersQuery.isLoading}
            isUpdating={updateRoleMutation.isPending}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onSortChange={setSortBy}
            onUpdateRole={(uid, role) => updateRoleMutation.mutate({ uid, role })}
          />
          <AdminAuditTimeline logs={auditLogs.slice(0, 5)} isLoading={auditQuery.isLoading} />
        </>
      )}

      {activeTab === 'audit' && (
        <AdminAuditTimeline logs={auditLogs} isLoading={auditQuery.isLoading} />
      )}

      {activeTab === 'security' && <AdminSecuritySettingsPanel />}

      <InviteCuratorModal
        isOpen={isInviteOpen}
        isSubmitting={inviteMutation.isPending}
        errorMessage={inviteError}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={(payload) => inviteMutation.mutate(payload)}
      />
    </div>
  );
};
