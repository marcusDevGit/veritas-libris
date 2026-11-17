import React from 'react';
import type { ReservationItem } from '@app/shared';
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Info,
  GraduationCap,
} from 'lucide-react';

export interface BookReservationsSectionProps {
  reservations: ReservationItem[];
}

const TOPIC_TITLES: Record<string, string> = {
  DOCTRINAL_ERROR: 'Erro Doutrinário ou Heresia',
  MORAL_RELATIVISM: 'Relativismo Moral ou Subversão',
  SENSUAL_CONTENT: 'Imodéstia & Conteúdo Sensual',
  VIOLENCE_GORE: 'Violência Explícita ou Crueldade',
  OCCULTISM: 'Ocultismo, Magia ou Superstição',
  PROFANITY: 'Blasfêmia ou Linguagem Profana',
  ANTICLERICALISM: 'Anticlericalismo ou Escândalo Eclesial',
};

const SEVERITY_CONFIG = {
  HIGH: {
    label: 'Gravidade Alta',
    intensity: '85%',
    barColor: 'bg-error',
    textColor: 'text-error',
    iconBg: 'bg-error-container text-on-error-container',
    guidance:
      'Desaconselhado para jovens ou leitores sem sólida formação doutrinária. Requer prudência redobrada e acompanhamento pedagógico.',
    Icon: AlertOctagon,
  },
  MEDIUM: {
    label: 'Gravidade Média',
    intensity: '55%',
    barColor: 'bg-secondary',
    textColor: 'text-secondary',
    iconBg: 'bg-secondary-container text-on-secondary-container',
    guidance:
      'Adequado com mediação formativa. Recomenda-se contextualizar a passagem à luz da moral católica.',
    Icon: AlertTriangle,
  },
  LOW: {
    label: 'Gravidade Leve',
    intensity: '25%',
    barColor: 'bg-primary',
    textColor: 'text-primary',
    iconBg: 'bg-surface-container-high text-primary',
    guidance:
      'Nota de atenção pontual; não compromete o aproveitamento geral da obra para a faixa etária indicada.',
    Icon: Info,
  },
};

/**
 * BookReservationsSection — Matriz de Ressalvas & Pontos de Cautela
 *
 * Reproduz a seção "Pontos de Atenção & Onde Exige Cautela" do Stitch:
 * - Cabeçalho com contagem de ressalvas analisadas
 * - Cards numerados com barra visual de severidade/intensidade
 * - Localização textual na obra (quando informada)
 * - Caixa branca interna com "Orientação Pastoral & Pedagógica"
 */
export const BookReservationsSection: React.FC<BookReservationsSectionProps> = ({
  reservations,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-sm border border-outline/10 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline/10">
        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
            Discernimento Moral Detalhado
          </span>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary mt-0.5">
            Pontos de Atenção & Onde Exige Cautela
          </h2>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant self-start sm:self-auto">
          {reservations.length}{' '}
          {reservations.length === 1 ? 'Ressalva Analisada' : 'Ressalvas Analisadas'}
        </span>
      </div>

      {reservations.length === 0 ? (
        <div className="p-6 bg-success-container/25 border border-success/20 rounded-xl flex items-center gap-3.5 text-success">
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <p className="text-xs sm:text-sm leading-relaxed">
            Nenhuma objeção moral ou doutrinária foi registrada para este título até o momento.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Consulte a segmentação dos conteúdos potencialmente sensíveis da obra para orientar leitores jovens, círculos de estudo paroquiais e colégios confessionais:
          </p>

          <div className="flex flex-col gap-4">
            {reservations.map((res, idx) => {
              const cfg = SEVERITY_CONFIG[res.severity] || SEVERITY_CONFIG.LOW;
              const IconComponent = cfg.Icon;

              return (
                <div
                  key={idx}
                  className="rounded-xl p-5 bg-surface-container-low border border-outline/10 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                        <IconComponent className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-editorial text-base font-bold text-primary">
                          {idx + 1}. {TOPIC_TITLES[res.topic] || res.topic}
                        </h3>
                        {res.reference && (
                          <span className="text-xs text-secondary font-medium">
                            Localização: {res.reference}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                      <div className="md:text-right">
                        <span className={`text-[11px] uppercase font-bold tracking-wider ${cfg.textColor}`}>
                          {cfg.label}
                        </span>
                        <p className="text-[11px] text-outline">Intensidade {cfg.intensity}</p>
                      </div>
                      <div className="w-16 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cfg.barColor}`}
                          style={{ width: cfg.intensity }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface leading-relaxed mb-3">
                    {res.description}
                  </p>

                  <div className="p-3 bg-surface-container-lowest rounded-lg flex items-start gap-2.5 text-xs text-on-surface-variant border border-outline/10">
                    <GraduationCap className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <span>
                      <strong>Orientação Pastoral & Pedagógica:</strong> {cfg.guidance}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
