import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Feather, Home, MessageSquareQuote, Scale, ShieldCheck } from 'lucide-react';

export const CriteriaHeroSection: React.FC = () => {
  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 pb-10 lg:pb-14">
        <nav
          aria-label="Navegação Estrutural"
          className="flex items-center gap-2 text-xs text-on-surface-variant mb-3"
        >
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Início</span>
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Critérios do Índice &amp; Metodologia</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8 flex flex-col">
            <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded bg-secondary-container/60 text-on-secondary-container text-[11px] font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              Metodologia de Discernimento • Magistério Perene
            </span>

            <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
              Critérios do Índice &amp; Metodologia
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-3xl mb-6">
              Como avaliamos obras literárias sob a tríplice perspectiva moral, doutrinária e estética à luz da Tradição Católica e do depósito da fé da Igreja.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface">
                <BookOpen className="w-4 h-4 text-secondary" />
                Cânones 822–832 CIC
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface">
                <Feather className="w-4 h-4 text-primary" />
                Enc. Pascendi Dominici Gregis
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-xs font-semibold text-on-surface">
                <MessageSquareQuote className="w-4 h-4 text-secondary" />
                Concílio Vaticano II • Inter Mirifica
              </span>
            </div>
          </div>

          <aside className="lg:col-span-4 bg-surface-container-low rounded-xl p-6 border border-outline/15 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline/15">
              <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
                Princípio Deontológico
              </span>
              <Scale className="w-4 h-4 text-secondary" />
            </div>
            <blockquote className="font-editorial text-sm sm:text-base leading-relaxed text-on-surface italic mb-4">
              “A verdade e a beleza jamais se opõem. A tutela da inteligência e da pureza dos fiéis não nasce do medo da arte, mas do amor soberano à saúde espiritual das almas.”
            </blockquote>
            <div className="pt-2 border-t border-outline/10">
              <p className="text-xs font-bold text-primary">Colégio Editorial Veritas Libris</p>
              <p className="text-[11px] text-on-surface-variant">
                Constituição de Governança Crítica §IV
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
