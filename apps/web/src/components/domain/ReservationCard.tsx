import React from 'react';
import {
  RESERVATION_TOPIC_LABELS,
  SEVERITY_LEVEL_LABELS,
  type ReservationItem,
} from '@app/shared';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Badge } from '../ui/Badge.js';

export interface ReservationCardProps {
  reservation: ReservationItem;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation }) => {
  const isHigh = reservation.severity === 'HIGH';
  const isMedium = reservation.severity === 'MEDIUM';

  const borderClass = isHigh
    ? 'border-error/40 bg-error-container/20'
    : isMedium
    ? 'border-warning/40 bg-warning-container/20'
    : 'border-outline/20 bg-surface-container-low';

  const severityBadgeVariant = isHigh ? 'error' : isMedium ? 'warning' : 'outline';

  return (
    <div className={`p-4 rounded-xl border ${borderClass} transition-all space-y-2`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-medium text-sm text-on-surface">
          {isHigh ? (
            <ShieldAlert className="w-4 h-4 text-error" />
          ) : (
            <AlertCircle className="w-4 h-4 text-secondary" />
          )}
          <span>{RESERVATION_TOPIC_LABELS[reservation.topic]}</span>
        </div>
        <Badge variant={severityBadgeVariant} size="sm">
          Severidade {SEVERITY_LEVEL_LABELS[reservation.severity]}
        </Badge>
      </div>

      <p className="text-sm text-on-surface-variant leading-relaxed">
        {reservation.description}
      </p>

      {reservation.reference && (
        <div className="text-xs text-outline font-medium pt-1">
          <span className="text-on-surface-variant">Referência / Passagem:</span> {reservation.reference}
        </div>
      )}
    </div>
  );
};
