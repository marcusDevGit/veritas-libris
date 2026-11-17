import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * TopBanner — Barra superior institucional do Veritas Libris
 * 
 * Exibe a divisa moral e lema litúrgico da plataforma conforme
 * a identidade visual do Stitch:
 * "Veritas Libris • Guiando famílias e leitores na fidelidade doutrinária e formação moral católica."
 */
export const TopBanner: React.FC = () => {
  return (
    <div className="w-full h-7 bg-primary px-4 flex items-center justify-center text-center border-b border-primary-container text-white">
      <p className="text-xs font-medium tracking-wide flex items-center justify-center gap-2">
        <BookOpen className="w-3.5 h-3.5 text-secondary-container shrink-0" />
        <span>Veritas Libris • Guiando famílias e leitores na fidelidade doutrinária e formação moral católica.</span>
      </p>
    </div>
  );
};
