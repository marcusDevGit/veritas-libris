import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * MethodologySection — Seção Explicativa Full-Width das 4 Dimensões de Discernimento Veritas
 * 
 * Faixa bg-surface-container de ponta a ponta com card branco centralizado em max-w-[1380px],
 * reproduzindo exatamente a estrutura visual do Stitch.
 */
export const MethodologySection: React.FC = () => {
  return (
    <section id="criterios" className="w-full bg-surface-container py-12 px-6 lg:px-8 mt-6">
      <div className="max-w-[1380px] mx-auto bg-surface-container-lowest rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 border border-outline/10">
        <div className="flex items-start gap-5 max-w-3xl">
          <div className="p-3 bg-secondary-container/40 text-secondary rounded-xl shrink-0">
            <BookOpen className="w-7 h-7 stroke-[1.5]" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-secondary uppercase">
                Metodologia Veritas
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="text-xs text-outline font-medium">
                Quadro de Análise em 4 Dimensões
              </span>
            </div>

            <h2 className="font-editorial text-xl sm:text-2xl font-normal text-primary tracking-snug leading-snug">
              Conheça os critérios de classificação e a metodologia de discernimento moral
            </h2>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Nossos pareceristas avaliam cada obra sob quatro dimensões cardeais: <em>Fidelidade Doutrinária</em>, <em>Pureza & Modéstia</em>, <em>Maturidade / Tratamento da Violência</em> e <em>Mérito Literário e Artístico</em>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
          <a
            href="#criterios"
            className="w-full sm:w-auto text-center px-5 py-3 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm whitespace-nowrap"
          >
            Guia de Critérios Completo
          </a>
          <a
            href="#sobre"
            className="w-full sm:w-auto text-center px-5 py-3 rounded-lg bg-surface-container text-primary font-semibold text-sm hover:bg-surface-container-high transition-colors whitespace-nowrap"
          >
            Corpo de Pareceristas
          </a>
        </div>
      </div>
    </section>
  );
};
