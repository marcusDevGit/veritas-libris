import React from 'react';
import { Lock, ShieldCheck, KeyRound, Activity } from 'lucide-react';

export const AdminSecuritySettingsPanel: React.FC = () => {
  const policies = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      title: 'Hierarquia RBAC em 3 Níveis',
      status: 'Ativo',
      description:
        'Administradores (ADMIN) herdam automaticamente todas as faculdades de Curador Oficial (CURATOR) e possuem acesso exclusivo à nomeação de equipe.',
    },
    {
      icon: <Lock className="w-5 h-5 text-secondary" />,
      title: 'Proteção contra Lockout do Último Admin',
      status: 'Obrigatório',
      description:
        'O servidor bloqueia qualquer tentativa de rebaixar ou remover o último administrador ativo da plataforma.',
    },
    {
      icon: <KeyRound className="w-5 h-5 text-primary" />,
      title: 'Bootstrap Seguro via ADMIN_EMAILS',
      status: 'Configurado no Servidor',
      description:
        'Contas fundadoras definidas na variável de ambiente ADMIN_EMAILS recebem papel de Superadministrador diretamente na verificação JWT do Firebase.',
    },
    {
      icon: <Activity className="w-5 h-5 text-success" />,
      title: 'Rate Limiting & Autenticação em Produção',
      status: 'Ativo',
      description:
        'Busca externa (20 req/min) e importação/enriquecimento (10 req/min) protegidos contra abuso, com JWT obrigatório em produção.',
    },
  ];

  return (
    <section className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      <div>
        <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
          Políticas Ativas do Servidor
        </span>
        <h2 className="font-editorial text-xl font-bold text-primary mt-0.5">
          Configurações de Segurança Canônica
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Regras de integridade aplicadas automaticamente pelo backend Fastify e Firebase Admin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((policy) => (
          <div
            key={policy.title}
            className="p-4 rounded-xl bg-surface-container-low border border-outline/15 flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-outline/15 flex items-center justify-center shrink-0">
              {policy.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-primary">{policy.title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-success-container/70 text-success text-[10px] font-bold uppercase shrink-0">
                  {policy.status}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                {policy.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
