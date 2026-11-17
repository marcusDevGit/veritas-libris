import React from 'react';
import type { AdequacyLevel, ReservationItem, ReservationTopic, SeverityLevel } from '@app/shared';
import { Trash2, PlusCircle, AlertCircle, AlertOctagon } from 'lucide-react';

export interface ReviewStepReservationsProps {
  adequacyVote: Exclude<AdequacyLevel, 'UNRATED'>;
  reservations: ReservationItem[];
  onChangeReservations: (items: ReservationItem[]) => void;
}

const TOPIC_OPTIONS: Array<{ value: ReservationTopic; label: string }> = [
  { value: 'DOCTRINAL_ERROR', label: 'Erro Doutrinário ou Heresia' },
  { value: 'MORAL_RELATIVISM', label: 'Relativismo Moral ou Subversão' },
  { value: 'SENSUAL_CONTENT', label: 'Imodéstia & Conteúdo Sensual' },
  { value: 'VIOLENCE_GORE', label: 'Violência Explícita ou Crueldade' },
  { value: 'OCCULTISM', label: 'Ocultismo, Magia ou Superstição' },
  { value: 'PROFANITY', label: 'Blasfêmia ou Linguagem Profana' },
  { value: 'ANTICLERICALISM', label: 'Anticlericalismo ou Escândalo Eclesial' },
];

const SEVERITY_BUTTONS: Array<{ value: SeverityLevel; label: string }> = [
  { value: 'LOW', label: 'Leve' },
  { value: 'MEDIUM', label: 'Moderado' },
  { value: 'HIGH', label: 'Grave' },
];

/**
 * ReviewStepReservations — Etapa 3: Construtor Dinâmico de Ressalvas
 *
 * Reproduz fielmente os cards editáveis de ressalva do Stitch:
 * - Tópico (enum oficial @app/shared)
 * - Capítulo/Trecho localizado
 * - Seletor de gravidade (Leve, Moderado, Grave)
 * - Justificativa moral e contexto
 */
export const ReviewStepReservations: React.FC<ReviewStepReservationsProps> = ({
  adequacyVote,
  reservations,
  onChangeReservations,
}) => {
  const requiresReservation = adequacyVote !== 'RECOMMENDED';

  const handleAddItem = () => {
    onChangeReservations([
      ...reservations,
      {
        topic: 'DOCTRINAL_ERROR',
        severity: adequacyVote === 'NOT_RECOMMENDED' ? 'HIGH' : 'MEDIUM',
        description: '',
        reference: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    onChangeReservations(reservations.filter((_, i) => i !== index));
  };

  const handleUpdateItem = <K extends keyof ReservationItem>(
    index: number,
    field: K,
    value: ReservationItem[K]
  ) => {
    const updated = reservations.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChangeReservations(updated);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            Etapa 3
          </span>
          <span className="text-outline text-xs">•</span>
          <h3 className="font-editorial text-lg font-bold text-primary">
            Pontos de Inadequação & Alertas
          </h3>
        </div>

        {requiresReservation && (
          <span className="text-[11px] font-bold text-secondary-container px-2.5 py-1 rounded bg-secondary">
            Obrigatório p/ Ressalvas
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-on-surface-variant -mt-2">
        Mapeie com precisão capitular os trechos sensíveis para guiar pais, diretores espirituais e educadores.
      </p>

      <div className="flex flex-col gap-4">
        {reservations.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-surface-container-low border border-outline/15 flex flex-col gap-4 relative shadow-2xs"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    Tópico / Categoria
                  </label>
                  <select
                    value={item.topic}
                    onChange={(e) =>
                      handleUpdateItem(idx, 'topic', e.target.value as ReservationTopic)
                    }
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline/20 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {TOPIC_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1">
                    Capítulo ou Trecho Localizado (opcional)
                  </label>
                  <input
                    type="text"
                    value={item.reference || ''}
                    onChange={(e) =>
                      handleUpdateItem(
                        idx,
                        'reference',
                        e.target.value || undefined
                      )
                    }
                    placeholder="Ex: Parte 1, Cap. VII (pág. 89)"
                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline/20 rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                title="Remover ressalva"
                className="text-on-surface-variant hover:text-error p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-on-surface">
                Gravidade do Trecho:
              </span>
              <div className="flex items-center gap-2">
                {SEVERITY_BUTTONS.map((sev) => {
                  const isSelected = item.severity === sev.value;

                  let activeStyle = 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high';
                  if (isSelected) {
                    if (sev.value === 'HIGH') {
                      activeStyle = 'bg-error text-on-error font-bold shadow-xs';
                    } else if (sev.value === 'MEDIUM') {
                      activeStyle = 'bg-secondary-container text-on-secondary-container font-bold shadow-xs';
                    } else {
                      activeStyle = 'bg-primary text-on-primary font-bold shadow-xs';
                    }
                  }

                  return (
                    <button
                      key={sev.value}
                      type="button"
                      onClick={() => handleUpdateItem(idx, 'severity', sev.value)}
                      className={`px-3 py-1 text-xs rounded flex items-center gap-1 transition-all cursor-pointer ${activeStyle}`}
                    >
                      {isSelected && sev.value === 'HIGH' && <AlertOctagon className="w-3 h-3" />}
                      {isSelected && sev.value === 'MEDIUM' && <AlertCircle className="w-3 h-3" />}
                      <span>{sev.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Justificativa Moral e Contexto Litúrgico/Doutrinário (mín. 10 caracteres)
              </label>
              <textarea
                rows={2}
                value={item.description}
                onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                placeholder="Descreva objetivamente o trecho e por que exige cautela..."
                className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline/20 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-outline/15 cursor-pointer"
      >
        <PlusCircle className="w-4 h-4 text-secondary" />
        <span>
          {reservations.length === 0
            ? 'Adicionar ponto de atenção / ressalva'
            : 'Adicionar outro ponto de atenção'}
        </span>
      </button>
    </section>
  );
};
