import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Quote, Scale, ShieldCheck } from 'lucide-react';

export const AboutHeroQuote: React.FC = () => {
  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 pb-4">
      <nav
        aria-label="Navegação Estrutural"
        className="flex items-center gap-2 text-xs text-on-surface-variant mb-3"
      >
        <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Início</span>
        </Link>
        <span className="text-outline-variant font-bold">/</span>
        <span className="text-primary font-bold">Sobre a Curadoria</span>
      </nav>

      <div className="flex flex-col gap-3 max-w-4xl">
        <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-[11px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
          Missão Pastoral &amp; Discernimento
        </span>
        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-primary tracking-tight">
          Sobre a Curadoria Veritas Libris
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
          Um serviço pastoral e literário independente dedicado a apoiar famílias, educadores, colégios e leitores católicos na formação de uma imaginação reta, livre e fecunda.
        </p>
      </div>

      <div className="mt-7 bg-surface-container-low border border-outline/15 rounded-xl p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-4 items-start max-w-3xl">
          <div className="w-11 h-11 rounded-full bg-surface-container-lowest border border-outline/15 flex items-center justify-center shrink-0 text-secondary shadow-2xs">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <blockquote className="font-editorial text-base sm:text-xl italic text-primary leading-snug">
              “A verdade e a beleza não se opõem; toda luz da inteligência procede da Sabedoria incriada, e nada do que é genuinamente belo é alheio a Deus.”
            </blockquote>
            <cite className="block text-[11px] uppercase font-bold text-secondary tracking-widest mt-2 not-italic">
              Inspiração Tomista • Summa Theologiae, I, q. 39, a. 8
            </cite>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-lowest border border-outline/15 shadow-2xs shrink-0 min-w-[180px]">
          <Scale className="w-7 h-7 text-secondary mb-1" />
          <span className="font-editorial text-base font-bold text-primary">Integritas</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
            Norma et Veritas
          </span>
        </div>
      </div>
    </section>
  );
};
