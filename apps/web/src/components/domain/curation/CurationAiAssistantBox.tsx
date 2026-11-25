import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdequacyLevel, AiQuotaStats, EditorialAiDraftResponse } from '@app/shared';
import {
  AlertCircle,
  BookMarked,
  Check,
  ExternalLink,
  Info,
  Scale,
  Sparkles,
} from 'lucide-react';
import { api, ApiError } from '../../../services/api.js';

interface CurationAiAssistantBoxProps {
  bookId: string;
  aiQuota?: AiQuotaStats;
  onApplyDraft: (draftText: string) => void;
}

const VERDICT_LABEL_MAP: Record<AdequacyLevel, { label: string; className: string }> = {
  RECOMMENDED: {
    label: 'Recomendado',
    className: 'bg-success-container/70 text-success border-success/30',
  },
  WITH_RESERVATIONS: {
    label: 'Com Ressalvas',
    className: 'bg-warning-container/70 text-warning border-warning/30',
  },
  NOT_RECOMMENDED: {
    label: 'Desaconselhado',
    className: 'bg-error-container/70 text-on-error-container border-error/30',
  },
  UNRATED: {
    label: 'Sem Avaliação',
    className: 'bg-surface-container text-on-surface-variant border-outline/20',
  },
};

export const CurationAiAssistantBox: React.FC<CurationAiAssistantBoxProps> = ({
  bookId,
  aiQuota,
  onApplyDraft,
}) => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<EditorialAiDraftResponse | null>(null);
  const [applied, setApplied] = useState(false);
  const [showCitationsOnly, setShowCitationsOnly] = useState(false);

  useEffect(() => {
    setDraft(null);
    setApplied(false);
    setShowCitationsOnly(false);
  }, [bookId]);

  const mutation = useMutation({
    mutationFn: () => api.generateEditorialAiDraft(bookId),
    onSuccess: (data) => {
      setDraft(data);
      setApplied(false);
      setShowCitationsOnly(false);
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['curation-queue'] });
    },
  });

  const errorMessage = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'Não foi possível consultar a Magisterium AI no momento.'
    : null;

  return (
    <section className="p-4 rounded-xl bg-surface-container-low border border-secondary/25 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-primary">
              Copiloto Doutrinário (Magisterium AI)
            </h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
              Sugere fundamentos e citações oficiais do Magistério para apoiar sua análise.
            </p>
            {aiQuota && (
              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  aiQuota.nearLimit
                    ? 'bg-warning-container/60 text-warning border-warning/30'
                    : 'bg-surface-container text-on-surface-variant border-outline/20'
                }`}
              >
                Cota IA hoje (UTC): {aiQuota.usedToday}/{aiQuota.dailyLimit}
                {aiQuota.nearLimit ? ` • restam ${aiQuota.remaining}` : ''}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="h-9 px-3.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:brightness-95 transition-all inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {mutation.isPending
              ? 'Consultando Magistério...'
              : 'Consultar Apoio Doutrinário'}
          </span>
        </button>
      </div>

      <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline/15 text-[11px] text-on-surface-variant flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-primary">Orientação aos Curadores:</strong> A Magisterium AI
          consulta documentos da Igreja (Catecismo, Concílios, Direito Canônico e Encíclicas), mas{' '}
          <strong>não lê o livro inteiro</strong> — analisa apenas título, autor, sinopse e ressalvas
          cadastradas. Ela gera apenas um <strong>rascunho revisável</strong>, nunca publica nem ativa
          trava editorial sozinha. Consultas repetidas usam cache para preservar a cota gratuita (100/dia).
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-error-container/60 border border-error/30 text-xs text-on-error-container flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {draft && (
        <div className="bg-surface-container-lowest border border-outline/20 rounded-lg p-3.5 flex flex-col gap-3">
          {applied ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-success inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 shrink-0" />
                Texto aplicado na Síntese abaixo para revisão.
              </span>
              <div className="flex items-center gap-2">
                {(draft.citations.length > 0 ||
                  draft.suggestedAdequacy ||
                  draft.suggestedAge ||
                  draft.recommendationRationale) && (
                  <button
                    type="button"
                    onClick={() => setShowCitationsOnly((prev) => !prev)}
                    className="h-7 px-2.5 rounded-md bg-surface-container text-primary text-[11px] font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    {showCitationsOnly
                      ? 'Ocultar recomendação e fontes'
                      : `Ver recomendação e fontes (${draft.citations.length})`}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setApplied(false)}
                  className="h-7 px-2.5 rounded-md border border-outline/25 text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Reabrir rascunho
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Rascunho Sugerido {draft.cached ? '• Recuperado do Cache' : '• Nova Consulta'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyDraft(draft.draftText);
                    setApplied(true);
                    setShowCitationsOnly(false);
                  }}
                  className="h-8 px-3 rounded-md bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar ao Rascunho da Nota</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {draft.draftText}
              </p>
            </>
          )}

          {(!applied || showCitationsOnly) &&
            (draft.suggestedAdequacy || draft.suggestedAge || draft.recommendationRationale) && (
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline/15 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-primary inline-flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-secondary" />
                    Sugestão Consultiva da IA (critério exclusivo do curador — não aplicada automaticamente)
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {draft.suggestedAdequacy && (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          VERDICT_LABEL_MAP[draft.suggestedAdequacy].className
                        }`}
                      >
                        {VERDICT_LABEL_MAP[draft.suggestedAdequacy].label}
                      </span>
                    )}
                    {draft.suggestedAge && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-tertiary text-on-tertiary">
                        {draft.suggestedAge === 'ALL' ? 'Livre' : draft.suggestedAge}
                      </span>
                    )}
                  </div>
                </div>

                {draft.recommendationRationale && (
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-primary">Por quê:</strong>{' '}
                    {draft.recommendationRationale}
                  </p>
                )}
              </div>
            )}

          {(!applied || showCitationsOnly) && draft.citations.length > 0 && (
            <div className="pt-2.5 border-t border-outline/10 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-primary inline-flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-secondary" />
                Referências do Magistério para Conferência:
              </span>
              <ul className="space-y-1.5">
                {draft.citations.map((cit, idx) => (
                  <li
                    key={`${cit.documentTitle ?? 'doc'}-${idx}`}
                    className="text-[11px] text-on-surface-variant bg-surface-container-low rounded-md p-2 border border-outline/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 font-semibold text-primary">
                      <span>
                        {cit.documentTitle || 'Documento Eclesial'}
                        {cit.documentReference ? ` (§ ${cit.documentReference})` : ''}
                        {cit.documentYear ? ` • ${cit.documentYear}` : ''}
                      </span>
                      {cit.sourceUrl && (
                        <a
                          href={cit.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary hover:underline inline-flex items-center gap-1"
                        >
                          <span>Fonte</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1 italic line-clamp-2">“{cit.citedText}”</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
