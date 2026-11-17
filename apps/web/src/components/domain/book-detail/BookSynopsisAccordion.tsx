import React, { useState } from 'react';
import { BookOpenText, ChevronDown } from 'lucide-react';

export interface BookSynopsisAccordionProps {
  synopsis?: string;
}

/**
 * BookSynopsisAccordion — Seção Colapsável de Sinopse Literária & Dimensão Teológica
 *
 * Reproduz o acordeão editorial do Stitch com toggle interativo em React.
 */
export const BookSynopsisAccordion: React.FC<BookSynopsisAccordionProps> = ({
  synopsis,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!synopsis) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-sm border border-outline/10">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <BookOpenText className="w-6 h-6 text-primary shrink-0" />
          <div>
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-primary group-hover:text-primary-container transition-colors">
              Sinopse Literária & Dimensão Teológica
            </h2>
            <span className="text-xs text-outline">
              Resumo da obra e contexto narrativo
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-on-surface-variant transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-outline/15 text-sm sm:text-base text-on-surface leading-relaxed space-y-4">
          {synopsis.split('\n').map((paragraph, idx) =>
            paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
          )}
        </div>
      )}
    </div>
  );
};
