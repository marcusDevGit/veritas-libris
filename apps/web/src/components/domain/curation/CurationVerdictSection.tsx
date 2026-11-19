import React from 'react';
import type { AdequacyLevel, AgeRating } from '@app/shared';
import { AlertTriangle, Ban, CheckCircle2, Lock } from 'lucide-react';

interface CurationVerdictSectionProps {
  editorialLock: boolean;
  adequacyStatus: AdequacyLevel;
  recommendedAge: AgeRating;
  onToggleLock: () => void;
  onChangeAdequacy: (value: AdequacyLevel) => void;
  onChangeAge: (value: AgeRating) => void;
}

const ADEQUACY_OPTIONS: Array<{
  value: AdequacyLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeClass: string;
}> = [
  {
    value: 'RECOMMENDED',
    label: 'Recomendado',
    description: 'Leitura edificante e alinhada à formação católica.',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-700" />,
    activeClass: 'border-emerald-600 bg-emerald-50/70',
  },
  {
    value: 'WITH_RESERVATIONS',
    label: 'Com Ressalvas',
    description: 'Útil com discernimento, maturidade ou acompanhamento.',
    icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
    activeClass: 'border-amber-600 bg-amber-50/70',
  },
  {
    value: 'NOT_RECOMMENDED',
    label: 'Não Recomendado',
    description: 'Contém desvios doutrinários ou morais graves.',
    icon: <Ban className="w-4 h-4 text-error" />,
    activeClass: 'border-error bg-rose-50/70',
  },
];

const AGE_OPTIONS: AgeRating[] = ['ALL', '10+', '12+', '14+', '16+', '18+'];

export const CurationVerdictSection: React.FC<CurationVerdictSectionProps> = ({
  editorialLock,
  adequacyStatus,
  recommendedAge,
  onToggleLock,
  onChangeAdequacy,
  onChangeAge,
}) => {
  return (
    <section className="p-4 rounded-xl bg-surface-container-low border border-outline/15 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-bold text-primary">
              Trava Editorial Oficial (editorialLock)
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Quando ativada, o veredito oficial definido abaixo sobrepõe o cálculo automático da comunidade. Ao desativar, o consenso comunitário é restaurado.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={editorialLock}
          onClick={onToggleLock}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            editorialLock ? 'bg-primary' : 'bg-outline/40'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform ${
              editorialLock ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ADEQUACY_OPTIONS.map((opt) => {
          const active = adequacyStatus === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={!editorialLock}
              onClick={() => onChangeAdequacy(opt.value)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                active
                  ? opt.activeClass
                  : 'bg-surface-container-lowest border-outline/20 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-on-surface">
                {opt.icon}
                {opt.label}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-bold text-primary mr-1">Faixa Etária Oficial:</span>
        {AGE_OPTIONS.map((age) => (
          <button
            key={age}
            type="button"
            disabled={!editorialLock}
            onClick={() => onChangeAge(age)}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
              recommendedAge === age
                ? 'bg-tertiary text-on-tertiary'
                : 'bg-surface-container-lowest border border-outline/20 text-on-surface-variant hover:border-primary/40'
            }`}
          >
            {age === 'ALL' ? 'Livre' : age}
          </button>
        ))}
      </div>
    </section>
  );
};
