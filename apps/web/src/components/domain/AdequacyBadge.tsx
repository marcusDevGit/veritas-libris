import React from 'react';
import { ADEQUACY_LEVEL_LABELS, type AdequacyLevel } from '@app/shared';
import { Badge } from '../ui/Badge.js';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export interface AdequacyBadgeProps {
  status: AdequacyLevel;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const AdequacyBadge: React.FC<AdequacyBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const configs: Record<
    AdequacyLevel,
    { variant: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }
  > = {
    RECOMMENDED: {
      variant: 'success',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-success inline" />,
    },
    WITH_RESERVATIONS: {
      variant: 'warning',
      icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-secondary inline" />,
    },
    NOT_RECOMMENDED: {
      variant: 'error',
      icon: <XCircle className="w-3.5 h-3.5 mr-1 text-error inline" />,
    },
    UNRATED: {
      variant: 'default',
      icon: <HelpCircle className="w-3.5 h-3.5 mr-1 text-outline inline" />,
    },
  };

  const current = configs[status] ?? configs.UNRATED;

  return (
    <Badge variant={current.variant} size={size} className="capitalize">
      {showIcon && current.icon}
      {ADEQUACY_LEVEL_LABELS[status]}
    </Badge>
  );
};
