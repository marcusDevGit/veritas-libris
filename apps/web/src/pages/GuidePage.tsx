import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText, Home } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { GUIDE_TABS, type GuideTabId } from '../components/domain/guide/guideData.js';
import { GuideSectionContent } from '../components/domain/guide/GuideSectionContent.js';

export const GuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTabId>('criterios');

  usePageMeta(
    'Guia da Plataforma',
    'Manual interativo da Veritas Libris: critérios de discernimento, papéis de leitores, curadores e administradores, sugestões e funcionalidades.',
  );

  return (
    <div className="pt-28 sm:pt-[120px] pb-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Guia da Plataforma</span>
        </nav>

        <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container text-[11px] font-bold uppercase tracking-widest mt-1">
          <BookOpenText className="w-3.5 h-3.5 text-secondary" />
          Manual Operacional &amp; Ético
        </span>

        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-primary tracking-tight mt-1">
          Guia da Plataforma Veritas Libris
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-3xl">
          Consulte como funciona o discernimento literário, o que se espera de leitores, curadores e administradores e como aproveitar todos os recursos do catálogo.
        </p>
      </header>

      <section className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col gap-6">
        <div
          role="tablist"
          aria-label="Seções do Guia da Plataforma"
          className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 pb-3 border-b border-outline/15"
        >
          {GUIDE_TABS.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isLastOdd = index === GUIDE_TABS.length - 1 && GUIDE_TABS.length % 2 === 1;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-center transition-colors cursor-pointer ${
                  isLastOdd ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <GuideSectionContent activeTab={activeTab} />
      </section>
    </div>
  );
};
