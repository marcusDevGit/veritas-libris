import React from 'react';
import { Award } from 'lucide-react';
import { Badge } from '../ui/Badge.js';

export interface ImprimaturSealProps {
  className?: string;
  expanded?: boolean;
}

export const ImprimaturSeal: React.FC<ImprimaturSealProps> = ({
  className,
  expanded = false,
}) => {
  if (!expanded) {
    return (
      <Badge variant="gold" size="sm" className={className} title="Possui Imprimatur ou aprovação eclesiástica">
        <Award className="w-3 h-3 mr-1 text-secondary" />
        Imprimatur
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-secondary-container/30 border border-secondary/20 rounded-lg text-on-surface">
      <div className="p-2 bg-secondary text-on-secondary rounded-full">
        <Award className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold font-editorial text-secondary">
          Aprovação Eclesiástica (Imprimatur / Nihil Obstat)
        </h4>
        <p className="text-xs text-on-surface-variant">
          Esta obra possui declaração oficial da autoridade eclesiástica de que nada contém contrário à fé e aos bons costumes.
        </p>
      </div>
    </div>
  );
};
