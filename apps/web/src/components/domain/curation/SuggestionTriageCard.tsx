import React, { useState } from 'react';
import {
  BookOpen,
  BookPlus,
  Check,
  Clock,
  Lightbulb,
  Mail,
  User,
  X,
} from 'lucide-react';
import { normalizeIsbn, type SuggestionDto, type SuggestionStatus } from '@app/shared';

interface SuggestionTriageCardProps {
  suggestion: SuggestionDto;
  isBusy: boolean;
  onTriage: (id: string, status: SuggestionStatus, resolutionNote?: string) => void;
  onImportBook: (isbn13: string, suggestionId: string) => void;
}

const STATUS_BADGE_MAP: Record<SuggestionStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pendente',
    className: 'bg-warning-container/70 text-warning border-warning/30',
  },
  REVIEWED: {
    label: 'Em análise',
    className: 'bg-secondary-container/70 text-on-secondary-container border-secondary/30',
  },
  ACCEPTED: {
    label: 'Aceita',
    className: 'bg-success-container/70 text-success border-success/30',
  },
  DISMISSED: {
    label: 'Descartada',
    className: 'bg-surface-container-high text-on-surface-variant border-outline/20',
  },
};

function formatDatePtBr(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const SuggestionTriageCard: React.FC<SuggestionTriageCardProps> = ({
  suggestion,
  isBusy,
  onTriage,
  onImportBook,
}) => {
  const [resolutionNote, setResolutionNote] = useState(suggestion.resolutionNote ?? '');

  const normalizedIsbn =
    suggestion.type === 'BOOK' && suggestion.isbn13 ? normalizeIsbn(suggestion.isbn13) : null;
  const statusInfo = STATUS_BADGE_MAP[suggestion.status];

  return (
    <article className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 shadow-xs flex flex-col gap-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
              suggestion.type === 'BOOK'
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-tertiary-container/60 text-on-tertiary-container border-tertiary/20'
            }`}
          >
            {suggestion.type === 'BOOK' ? (
              <BookOpen className="w-3 h-3" />
            ) : (
              <Lightbulb className="w-3 h-3" />
            )}
            {suggestion.type === 'BOOK' ? 'Indicação de Obra' : 'Melhoria / Correção'}
          </span>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
        </div>

        <span className="text-xs text-outline">{formatDatePtBr(suggestion.createdAt)}</span>
      </div>

      <div>
        <h3 className="font-editorial text-lg font-bold text-primary leading-snug">
          {suggestion.title}
        </h3>
        {(suggestion.author || suggestion.isbn13) && (
          <p className="text-xs text-on-surface-variant mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {suggestion.author && <span>Autor: {suggestion.author}</span>}
            {suggestion.isbn13 && (
              <span className="font-mono text-[11px] bg-surface-container px-2 py-0.5 rounded">
                ISBN: {suggestion.isbn13}
              </span>
            )}
          </p>
        )}
      </div>

      <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low/60 border border-outline/10 rounded-lg p-3">
        {suggestion.message}
      </p>

      {(suggestion.senderName || suggestion.senderEmail) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
          {suggestion.senderName && (
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-outline" />
              {suggestion.senderName}
            </span>
          )}
          {suggestion.senderEmail && (
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-outline" />
              {suggestion.senderEmail}
            </span>
          )}
        </div>
      )}

      {suggestion.reviewedByName && suggestion.reviewedAt && (
        <p className="text-[11px] text-outline">
          Triado por <strong className="text-on-surface-variant">{suggestion.reviewedByName}</strong> em{' '}
          {formatDatePtBr(suggestion.reviewedAt)}
        </p>
      )}

      <div className="pt-2 border-t border-outline/10 flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        <input
          type="text"
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          placeholder="Nota interna de resolução (opcional)..."
          maxLength={500}
          disabled={isBusy}
          className="flex-1 h-9 px-3 rounded-lg bg-surface border border-outline/25 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
        />

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {normalizedIsbn && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onImportBook(normalizedIsbn, suggestion.id)}
              className="h-9 px-3 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <BookPlus className="w-3.5 h-3.5" />
              Importar Obra
            </button>
          )}

          <button
            type="button"
            disabled={isBusy}
            onClick={() => onTriage(suggestion.id, 'REVIEWED', resolutionNote)}
            className="h-9 px-2.5 rounded-lg border border-outline/25 bg-surface text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Clock className="w-3.5 h-3.5 text-secondary" />
            Analisar
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => onTriage(suggestion.id, 'ACCEPTED', resolutionNote)}
            className="h-9 px-2.5 rounded-lg bg-success-container text-success text-xs font-semibold hover:brightness-95 transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            Aceitar
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => onTriage(suggestion.id, 'DISMISSED', resolutionNote)}
            className="h-9 px-2.5 rounded-lg bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-error-container hover:text-on-error-container transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Descartar
          </button>
        </div>
      </div>
    </article>
  );
};
