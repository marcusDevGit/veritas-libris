import React from 'react';
import type { CommunityStats } from '@app/shared';

export interface CommunityStatsBarProps {
  stats: CommunityStats;
}

export const CommunityStatsBar: React.FC<CommunityStatsBarProps> = ({ stats }) => {
  const total = stats.totalReviews;

  if (total === 0) {
    return (
      <div className="text-xs text-outline italic py-2">
        Ainda não há avaliações comunitárias para esta obra.
      </div>
    );
  }

  const recPct = Math.round((stats.recommendedCount / total) * 100);
  const resPct = Math.round((stats.reservationsCount / total) * 100);
  const notPct = Math.round((stats.notRecommendedCount / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-on-surface-variant">
        <span>Consenso Comunitário ({total} {total === 1 ? 'avaliação' : 'avaliações'})</span>
        <span className="font-medium text-success">{recPct}% Recomendam</span>
      </div>

      <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden flex">
        {recPct > 0 && (
          <div
            style={{ width: `${recPct}%` }}
            className="bg-success h-full transition-all"
            title={`${stats.recommendedCount} recomendam (${recPct}%)`}
          />
        )}
        {resPct > 0 && (
          <div
            style={{ width: `${resPct}%` }}
            className="bg-secondary h-full transition-all"
            title={`${stats.reservationsCount} com ressalvas (${resPct}%)`}
          />
        )}
        {notPct > 0 && (
          <div
            style={{ width: `${notPct}%` }}
            className="bg-error h-full transition-all"
            title={`${stats.notRecommendedCount} não recomendam (${notPct}%)`}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-outline pt-0.5">
        <span className="text-success font-medium">● {stats.recommendedCount} Favoráveis</span>
        <span className="text-secondary font-medium">● {stats.reservationsCount} Ressalvas</span>
        <span className="text-error font-medium">● {stats.notRecommendedCount} Contraindicados</span>
      </div>
    </div>
  );
};
