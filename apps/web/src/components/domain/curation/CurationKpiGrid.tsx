import React from 'react';
import type { CurationStats } from '@app/shared';
import { Hourglass, Scale, Award, Lock, CheckCircle2, FileEdit } from 'lucide-react';

interface CurationKpiGridProps {
  stats: CurationStats;
}

export const CurationKpiGrid: React.FC<CurationKpiGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Pendentes de Revisão
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl font-bold text-primary">
              {stats.pendingReview}
            </span>
            <span className="text-xs text-on-surface-variant">obras</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded w-fit mt-1">
            <FileEdit className="w-3 h-3" />
            Exige Parecer
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-amber-800 shrink-0">
          <Hourglass className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Com Trava Editorial
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl font-bold text-primary">
              {stats.locked}
            </span>
            <span className="text-xs text-on-surface-variant">obras</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded w-fit mt-1">
            <Lock className="w-3 h-3" />
            editorialLock Ativo
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
          <Scale className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Com Imprimatur / Nihil Obstat
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-2xl font-bold text-primary">
              {stats.imprimatur}
            </span>
            <span className="text-xs text-on-surface-variant">obras</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded w-fit mt-1">
            <CheckCircle2 className="w-3 h-3" />
            Chancela Validada
          </span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-emerald-800 shrink-0">
          <Award className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
