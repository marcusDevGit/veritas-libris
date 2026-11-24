import React from 'react';
import { Users, CheckCircle2, Shield, X } from 'lucide-react';

export interface FamilyModeWidgetProps {
  isFamilyMode: boolean;
  onToggleFamilyMode: (enabled: boolean) => void;
  totalBooks?: number;
  reviewedBooks?: number;
}

/**
 * FamilyModeWidget — Hero Editorial Full-Width com Filtro Rápido de Proteção Familiar
 * 
 * Faixa contínua de ponta a ponta logo abaixo da Navbar, alinhada ao Stitch:
 * - Fundo bg-surface-container-low full-bleed
 * - Conteúdo alinhado em max-w-[1380px]
 * - Switch interativo "Modo Família (Livre até 14 anos)" + métricas do acervo
 */
export const FamilyModeWidget: React.FC<FamilyModeWidgetProps> = ({
  isFamilyMode,
  onToggleFamilyMode,
  totalBooks = 2480,
  reviewedBooks = 840,
}) => {
  return (
    <div className="w-full flex flex-col">
      <section className="w-full bg-surface-container-low py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-b border-outline/10">
        <div className="max-w-[1380px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-widest text-secondary uppercase bg-secondary-container/40">
                Fidelitas & Sapientia
              </span>
              <span className="text-xs text-outline">•</span>
              <span className="text-xs font-semibold text-on-surface-variant">
                Índice Pastoral de Leitura
              </span>
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-[32px] font-bold text-primary tracking-tight leading-tight">
              Discernimento Literário & Formação Moral
            </h1>

            <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
              Guia crítico e moral de obras clássicas, acadêmicas e contemporâneas sob o prisma da Doutrina da Fé, Tradição e Magistério Eclesial para pais, mestres e leitores prudentes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline/10 w-full lg:w-auto lg:shrink-0">
            <div className="flex items-center justify-between sm:justify-start gap-3 pb-3 sm:pb-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-outline/20">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-bold text-primary">
                    Modo Família
                  </span>
                </div>
                <span className="text-xs text-outline">
                  Livre até 14 anos
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isFamilyMode}
                onClick={() => onToggleFamilyMode(!isFamilyMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isFamilyMode
                    ? 'bg-primary border-primary'
                    : 'bg-[#e2d8d2] border-outline/30'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    isFamilyMode ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col text-xs text-on-surface-variant gap-0.5">
              <span className="font-bold text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                {totalBooks.toLocaleString('pt-BR')} Obras Catalogadas
              </span>
              <span className="text-outline text-[11px]">
                {reviewedBooks.toLocaleString('pt-BR')} com Pareceres Exaustivos
              </span>
            </div>
          </div>
        </div>
      </section>

      {isFamilyMode && (
        <div className="w-full bg-surface-container-low px-4 sm:px-6 lg:px-8 pb-4">
          <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-high rounded-xl text-xs text-primary border border-secondary-container/40">
            <div className="flex items-start sm:items-center gap-2">
              <Shield className="w-4 h-4 text-secondary shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Modo Família Ativo:</strong> Ocultando títulos classificados como 16+, 18+ ou com ressalvas graves de imodéstia e blasfêmia.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToggleFamilyMode(false)}
              className="text-xs font-bold text-secondary hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto sm:ml-2 cursor-pointer"
            >
              <span>Desativar</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
