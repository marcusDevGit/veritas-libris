import React from 'react';
import type { AuditLogDto } from '@app/shared';
import { ClipboardCheck, KeyRound, Lock, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';

interface AdminAuditTimelineProps {
  logs: AuditLogDto[];
  isLoading: boolean;
}

export const AdminAuditTimeline: React.FC<AdminAuditTimelineProps> = ({ logs, isLoading }) => {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
            Integridade do Sistema
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary mt-0.5">
            Trilha de Auditoria &amp; Ações de Governança Recentes
          </h2>
          <p className="text-sm text-on-surface-variant">
            Registro cronológico de concessão de cargos e alterações editoriais críticas.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 sm:p-6 shadow-xs">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              Carregando histórico de auditoria...
            </p>
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              Nenhuma alteração de governança registrada até o momento.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-outline/10">
              {logs.map((log) => (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      log.action === 'ROLE_UPDATED'
                        ? 'bg-primary/10 text-primary'
                        : log.action === 'SUGGESTION_TRIAGED'
                          ? 'bg-success-container text-success'
                          : log.action === 'REVIEW_MODERATED'
                            ? 'bg-error-container text-error'
                            : log.action === 'AI_DRAFT_GENERATED'
                              ? 'bg-tertiary-container text-on-tertiary-container'
                              : 'bg-secondary-container text-secondary'
                    }`}
                  >
                    {log.action === 'ROLE_UPDATED' ? (
                      <KeyRound className="w-4 h-4" />
                    ) : log.action === 'SUGGESTION_TRIAGED' ? (
                      <ClipboardCheck className="w-4 h-4" />
                    ) : log.action === 'REVIEW_MODERATED' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : log.action === 'AI_DRAFT_GENERATED' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                    <div>
                      <p className="text-sm text-on-surface leading-relaxed">
                        <span className="font-semibold text-primary">{log.actorName}</span> —{' '}
                        {log.details} em <span className="font-semibold">{log.targetLabel}</span>.
                      </p>
                    </div>
                    <span className="text-xs text-on-surface-variant shrink-0">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="bg-surface-container-low border border-outline/15 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-primary">
            Governança Segura de Permissões (RBAC)
          </p>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 leading-relaxed">
            Administradores acumulam automaticamente as faculdades de Curador Oficial. Por segurança,
            o sistema bloqueia a remoção do último administrador ativo.
          </p>
        </div>
      </aside>
    </div>
  );
};
