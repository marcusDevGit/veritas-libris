import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, Send } from 'lucide-react';
import { CriteriaHeroSection } from '../components/domain/criteria/CriteriaHeroSection.js';
import { CriteriaDimensionsGrid } from '../components/domain/criteria/CriteriaDimensionsGrid.js';
import { CriteriaVerdictsSection } from '../components/domain/criteria/CriteriaVerdictsSection.js';
import { CriteriaAgeSection } from '../components/domain/criteria/CriteriaAgeSection.js';
import { CriteriaConsensusSection } from '../components/domain/criteria/CriteriaConsensusSection.js';

export const CriteriaPage: React.FC = () => {
  return (
    <div className="pt-[84px] sm:pt-[100px] pb-16 flex flex-col gap-12">
      <CriteriaHeroSection />

      <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-10 flex flex-col gap-12">
        <CriteriaDimensionsGrid />
        <CriteriaVerdictsSection />
        <CriteriaAgeSection />
        <CriteriaConsensusSection />

        <section className="bg-primary text-on-primary rounded-2xl p-8 lg:p-12 relative overflow-hidden shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 text-secondary-container text-[11px] font-bold uppercase tracking-widest">
              <BookOpen className="w-4 h-4" />
              <span>Participe da Tutela Cultural Católica</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-on-primary tracking-tight">
              Consulte as Obras ou Submeta um Novo Parecer
            </h2>
            <p className="text-xs sm:text-sm text-on-primary/80 leading-relaxed">
              Pesquise obras clássicas e contemporâneas já analisadas ou indique um novo título para exame do corpo curatorial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-secondary-container text-on-secondary-container text-xs sm:text-sm font-bold hover:opacity-95 transition-opacity"
            >
              <Compass className="w-4 h-4" />
              <span>Explorar Catálogo com Filtros</span>
            </Link>
            <Link
              to="/sugestoes"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary-container text-on-primary border border-on-primary/20 text-xs sm:text-sm font-semibold hover:bg-primary-container/80 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submeter Sugestão</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
