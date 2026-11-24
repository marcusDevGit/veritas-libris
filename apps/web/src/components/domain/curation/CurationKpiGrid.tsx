import React from 'react';
import type { CurationStats } from '@app/shared';
import { Hourglass, Scale, Award, Lock, CheckCircle2, FileEdit } from 'lucide-react';

interface CurationKpiGridProps {
  stats: CurationStats;
}

export const CurationKpiGrid: React.FC<CurationKpiGridProps> = ({ stats }) => {
  const mobileItems = [
    {
      label: 'Pendentes de Revisão',
      value: stats.pendingReview,
      icon: <Hourglass className="w-4 h-4 text-amber-800 shrink-0" />,
      badgeClass: 'bg-amber-50 text-amber-800',
    },
    {
      label: 'Com Trava Editorial',
      value: stats.locked,
      icon: <Scale className="w-4 h-4 text-primary shrink-0" />,
      badgeClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Com Imprimatur',
      value: stats.imprimatur,
      icon: <Award className="w-4 h-4 text-emerald-800 shrink-0" />,
      badgeClass: 'bg-emerald-50 text-emerald-800',
    },
  ];

  return (
    <>
      <div className="md:hidden bg-surface-container-lowest border border-outline/15 rounded-xl shadow-2xs divide-y divide-outline/10">
        {mobileItems.map((item) => (
          <div key={item.label} className="px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.badgeClass}`}>
                {item.icon}
              </span>
              <span className="text-xs font-bold text-on-surface-variant truncate">
                {item.label}
              </span>
            </div>
            <span className="font-editorial text-lg font-bold text-primary shrink-0">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-3 gap-5">
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
    </>
  );
};
