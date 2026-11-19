import React from 'react';
import type { RoleStats } from '@app/shared';
import { ShieldCheck, Feather, Users } from 'lucide-react';

interface AdminKpiGridProps {
  stats: RoleStats;
}

export const AdminKpiGrid: React.FC<AdminKpiGridProps> = ({ stats }) => {
  return (
    <section aria-label="Métricas de Governança" className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 shadow-xs hover:shadow-sm transition-shadow flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Administradores Ativos
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-2xl font-bold text-primary leading-none">
              {stats.admins}
            </span>
            <span className="text-xs text-secondary font-semibold">Governança RBAC</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Acesso completo à nomeação de curadores, auditoria e curadoria oficial.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 shadow-xs hover:shadow-sm transition-shadow flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <Feather className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Curadores Nomeados
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-2xl font-bold text-secondary leading-none">
              {stats.curators}
            </span>
            <span className="text-xs text-primary font-semibold">Peso 3 nas avaliações</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Pareceristas oficiais com faculdade de Trava Editorial e Imprimatur.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 shadow-xs hover:shadow-sm transition-shadow flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Leitores Cadastrados
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-2xl font-bold text-primary leading-none">
              {stats.readers}
            </span>
            <span className="text-xs text-on-surface-variant">Comunidade ativa</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Membros ativos com envio de avaliações comunitárias e listas pessoais.
          </p>
        </div>
      </div>
    </section>
  );
};
