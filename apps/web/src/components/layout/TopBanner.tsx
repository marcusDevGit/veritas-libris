import React from 'react';
import { BookOpen } from 'lucide-react';

export const TopBanner: React.FC = () => {
  return (
    <div className="w-full min-h-7 sm:h-7 py-1 sm:py-0 bg-primary px-3 sm:px-4 flex items-center justify-center text-center border-b border-primary-container text-white">
      <p className="text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 leading-tight">
        <BookOpen className="w-3.5 h-3.5 text-secondary-container shrink-0 hidden xs:inline sm:inline" />
        <span>Veritas Libris • Guiando famílias e leitores na fidelidade doutrinária e formação moral católica.</span>
      </p>
    </div>
  );
};
