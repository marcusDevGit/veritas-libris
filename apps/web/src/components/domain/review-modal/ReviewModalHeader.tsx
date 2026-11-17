import React from 'react';
import { Scale, X, ChevronRight } from 'lucide-react';
import type { BookDto } from '@app/shared';

export interface ReviewModalHeaderProps {
  book: BookDto;
  currentStep: number;
  onSelectStep: (step: number) => void;
  onClose: () => void;
}

const STEPS = [
  { number: 1, label: 'Classificação Geral' },
  { number: 2, label: 'Temas & Tags' },
  { number: 3, label: 'Pontos de Inadequação' },
  { number: 4, label: 'Parecer Crítico' },
];

/**
 * ReviewModalHeader — Cabeçalho Institucional e Rastreador das 4 Etapas
 *
 * Reproduz exatamente o topo do modal "Avaliar Livro & Ressalvas" do Stitch:
 * - Barra azul com ícone de balança, título editorial, metadados da obra e botão fechar
 * - Barra de progresso com as 4 etapas clicáveis
 */
export const ReviewModalHeader: React.FC<ReviewModalHeaderProps> = ({
  book,
  currentStep,
  onSelectStep,
  onClose,
}) => {
  return (
    <div className="w-full flex flex-col shrink-0">
      <div className="w-full bg-primary px-6 sm:px-8 py-4 flex items-center justify-between text-on-primary">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-secondary-container shrink-0">
            <Scale className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h2 className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-white leading-tight truncate">
              Avaliação & Discernimento Católico de Leitura
            </h2>
            <p className="text-xs text-on-primary-container flex flex-wrap items-center gap-1.5 mt-0.5">
              <span>Obra:</span>
              <strong className="text-white font-semibold truncate max-w-[200px] sm:max-w-xs">
                {book.title}
              </strong>
              <span>•</span>
              <span className="truncate max-w-[160px]">{book.authors[0]}</span>
              <span className="text-secondary-container text-[11px] font-mono px-1.5 py-0.5 bg-primary-container rounded ml-1">
                ISBN {book.isbn13}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Fechar formulário"
          className="p-2 rounded-lg text-on-primary-container hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full bg-surface-container-low px-6 sm:px-8 py-3.5 flex items-center justify-between gap-2 overflow-x-auto border-b border-outline/10">
        {STEPS.map((step, idx) => {
          const isCurrent = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={() => onSelectStep(step.number)}
                className={`flex items-center gap-2 text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  isCurrent
                    ? 'text-secondary font-bold'
                    : isCompleted
                      ? 'text-primary font-bold'
                      : 'text-on-surface-variant font-medium hover:text-primary'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    isCurrent
                      ? 'bg-secondary text-white'
                      : isCompleted
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {step.number}
                </span>
                <span>{step.label}</span>
              </button>

              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-outline/60 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
