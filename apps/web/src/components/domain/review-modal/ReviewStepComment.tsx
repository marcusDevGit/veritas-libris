import React from 'react';
import { CheckCircle2, Church } from 'lucide-react';

export interface ReviewStepCommentProps {
  comment: string;
  onChangeComment: (val: string) => void;
}

const MIN_CHARS = 10;

/**
 * ReviewStepComment — Etapa 4: Parecer Editorial & Discernimento
 *
 * Reproduz a etapa final do formulário do Stitch com contador de caracteres,
 * indicador de mínimo canônico e aviso de curadoria/moderação.
 */
export const ReviewStepComment: React.FC<ReviewStepCommentProps> = ({
  comment,
  onChangeComment,
}) => {
  const charCount = comment.trim().length;
  const isValid = charCount >= MIN_CHARS;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Etapa 4
          </span>
          <span className="text-outline text-xs">•</span>
          <h3 className="font-editorial text-lg font-bold text-primary">
            Parecer Editorial & Discernimento
          </h3>
        </div>

        <span className="text-xs text-outline">Mínimo de {MIN_CHARS} caracteres</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => onChangeComment(e.target.value)}
          placeholder="Descreva os méritos literários, a fidelidade doutrinária e os cuidados que o leitor católico deve ter ao abordar esta obra..."
          className="w-full p-4 rounded-xl bg-surface-container-lowest border border-outline/20 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs leading-relaxed"
        />

        <div className="flex items-center justify-between px-1 text-xs">
          <span
            className={`flex items-center gap-1 font-medium ${
              isValid ? 'text-secondary' : 'text-outline'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isValid
                ? 'Mínimo para submissão atingido'
                : `Faltam ${MIN_CHARS - charCount} caracteres`}
            </span>
          </span>

          <span className="text-on-surface-variant font-mono">
            {charCount} caracteres preenchidos
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-outline/10 flex items-start gap-3 mt-1">
        <Church className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-primary">
            Curadoria & Moderação Eclesial
          </span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Seu parecer contribui diretamente para o consenso comunitário da obra e passa por ponderação prudencial junto às revisões dos curadores oficiais do Veritas Libris.
          </p>
        </div>
      </div>
    </section>
  );
};
