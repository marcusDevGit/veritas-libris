import React from 'react';
import { Award, Lock, ShieldCheck, Terminal } from 'lucide-react';

export const CriteriaConsensusSection: React.FC = () => {
  return (
    <section className="bg-surface-container-low border border-outline/15 rounded-2xl p-6 sm:p-10 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline/15 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-secondary-container/60 text-on-secondary-container text-[11px] font-bold uppercase tracking-widest mb-2">
            <Lock className="w-3.5 h-3.5 text-secondary" />
            Governança &amp; Rigor Dogmático
          </span>
          <h2 className="font-editorial text-xl sm:text-3xl font-bold text-primary tracking-tight">
            Arquitetura do Consenso: Ponderação e Tutela Eclesial
          </h2>
        </div>

        <div className="inline-flex items-center gap-2.5 bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline/15 shadow-2xs text-xs font-bold text-primary shrink-0 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span>Algoritmo de Salvaguarda Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center font-bold text-xs mb-3">
            3:1
          </div>
          <h3 className="font-editorial text-base font-bold text-primary mb-1.5">
            Ponderação de Votos
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Curadores oficiais possuem peso 3 em cada avaliação. Votos de leitores cadastrados possuem peso 1 na composição do consenso.
          </p>
        </div>

        <div className="flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center font-bold text-xs mb-3">
            40%
          </div>
          <h3 className="font-editorial text-base font-bold text-primary mb-1.5">
            Threshold de Prudência
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Se 40% ou mais dos votos ponderados indicarem &ldquo;Não Recomendado&rdquo;, a obra assume esse alerta automaticamente por prudência.
          </p>
        </div>

        <div className="flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-editorial text-base font-bold text-primary mb-1.5">
            Trava Editorial (<code className="font-mono text-[11px]">editorialLock</code>)
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            O colegiado pode fixar <code className="font-mono text-[11px]">editorialLock = true</code>, impedindo distorções por avaliações coordenadas.
          </p>
        </div>

        <div className="flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center mb-3">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="font-editorial text-base font-bold text-primary mb-1.5">
            Selo <em>Imprimatur</em> Auditado
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Registro explícito de licenças eclesiásticas (<em>Nihil Obstat</em> e <em>Imprimatur</em>) apenas para edições formalmente aprovadas.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 sm:p-5 rounded-xl bg-surface-container-lowest border border-outline/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-secondary-container/70 text-on-secondary-container flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-primary block">
              Fórmula de Discernimento Ponderado
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Peso Curador (3x) + Peso Comunidade (1x) + Trava de Prudência (≥ 40%) + Editorial Lock
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant shrink-0">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span>STATUS: CANONICAMENTE CONFORME</span>
        </div>
      </div>
    </section>
  );
};
