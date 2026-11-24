import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, HeartHandshake, Send } from 'lucide-react';
import { AboutHeroQuote } from '../components/domain/about/AboutHeroQuote.js';
import { AboutMissionTriad } from '../components/domain/about/AboutMissionTriad.js';
import { AboutOperationsAndFoundations } from '../components/domain/about/AboutOperationsAndFoundations.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export const AboutCurationPage: React.FC = () => {
  usePageMeta(
    'Sobre a Curadoria',
    'Entenda a missão pastoral, a independência editorial e a equipe de curadoria literária do Veritas Libris.',
  );

  return (
    <div className="pt-28 sm:pt-[116px] pb-16 flex flex-col gap-10">
      <AboutHeroQuote />
      <AboutMissionTriad />
      <AboutOperationsAndFoundations />

      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="bg-primary text-on-primary rounded-2xl p-8 lg:p-12 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary text-on-secondary text-[11px] font-bold uppercase tracking-widest">
              <HeartHandshake className="w-3.5 h-3.5" />
              Apostolado da Boa Leitura
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-on-primary">
              Una-se ao nosso apostolado de discernimento literário
            </h2>
            <p className="text-xs sm:text-sm text-on-primary/80 leading-relaxed">
              Explore o acervo avaliado para sua família ou colégio, ou indique novas obras para exame da nossa curadoria.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
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
              <span>Sugerir Obra para Análise</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
