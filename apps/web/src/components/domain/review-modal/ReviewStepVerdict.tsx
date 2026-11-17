import React from 'react';
import type { AdequacyLevel, AgeRating } from '@app/shared';
import { CheckCircle2, AlertTriangle, Ban, ShieldCheck } from 'lucide-react';

export interface ReviewStepVerdictProps {
  adequacyVote: Exclude<AdequacyLevel, 'UNRATED'>;
  onChangeAdequacy: (val: Exclude<AdequacyLevel, 'UNRATED'>) => void;
  ageVote: AgeRating;
  onChangeAge: (val: AgeRating) => void;
}

const VERDICT_OPTIONS: Array<{
  value: Exclude<AdequacyLevel, 'UNRATED'>;
  label: string;
  description: string;
  badgeStyle: string;
  selectedContainerStyle: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'RECOMMENDED',
    label: 'Recomendado',
    description:
      'Total conformidade doutrinária e moral católica; edifica, instrui ou eleva a alma sem perigo espiritual.',
    badgeStyle: 'bg-success-container text-success',
    selectedContainerStyle: 'bg-success-container/25 border-success/50 shadow-md',
    Icon: CheckCircle2,
  },
  {
    value: 'WITH_RESERVATIONS',
    label: 'Com Ressalvas',
    description:
      'Valor literário, clássico ou reflexivo notório, porém contém passagens cruas, violentas ou ambíguas que exigem maturidade cristã.',
    badgeStyle: 'bg-secondary-container text-on-secondary-container',
    selectedContainerStyle: 'bg-secondary-container/25 border-secondary shadow-md',
    Icon: AlertTriangle,
  },
  {
    value: 'NOT_RECOMMENDED',
    label: 'Desaconselhado',
    description:
      'Promove ativamente heresias, blasfêmias contra a Fé, pornografia explícita ou relativismo moral destrutivo.',
    badgeStyle: 'bg-error-container text-on-error-container',
    selectedContainerStyle: 'bg-error-container/25 border-error/50 shadow-md',
    Icon: Ban,
  },
];

const AGE_OPTIONS: Array<{ value: AgeRating; label: string }> = [
  { value: 'ALL', label: 'Livre' },
  { value: '10+', label: '10+' },
  { value: '12+', label: '12+' },
  { value: '14+', label: '14+' },
  { value: '16+', label: '16+' },
  { value: '18+', label: '18+' },
];

/**
 * ReviewStepVerdict — Etapa 1: Classificação Moral & Faixa Etária Sugerida
 *
 * Reproduz fielmente os 3 cards tripartite e os chips etários do Stitch.
 */
export const ReviewStepVerdict: React.FC<ReviewStepVerdictProps> = ({
  adequacyVote,
  onChangeAdequacy,
  ageVote,
  onChangeAge,
}) => {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Etapa 1
          </span>
          <span className="text-outline text-xs">•</span>
          <h3 className="font-editorial text-lg font-bold text-primary">
            Classificação Moral & Prudencial
          </h3>
        </div>
        <span className="text-xs text-secondary font-medium flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Critério do Magistério</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VERDICT_OPTIONS.map((option) => {
          const isSelected = adequacyVote === option.value;
          const IconComp = option.Icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeAdequacy(option.value)}
              className={`text-left relative flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? option.selectedContainerStyle
                  : 'bg-surface-container-lowest border-outline/15 hover:bg-surface-container-low shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3 w-full">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? option.badgeStyle
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{option.label}</span>
                </span>

                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>

              <p
                className={`text-xs leading-relaxed ${
                  isSelected ? 'text-on-surface font-medium' : 'text-on-surface-variant'
                }`}
              >
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="pt-2 flex flex-col gap-2.5">
        <label className="text-xs sm:text-sm text-primary font-semibold flex items-center gap-2">
          <span>Faixa Etária Sugerida</span>
          <span className="text-xs text-outline font-normal">(Discernimento formativo)</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {AGE_OPTIONS.map((opt) => {
            const isSelected = ageVote === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeAge(opt.value)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-tertiary text-on-tertiary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
