import React, { useEffect, useState } from 'react';
import type {
  AdequacyLevel,
  AgeRating,
  BookDto,
  ReservationItem,
  UpdateBookEditorialBody,
} from '@app/shared';
import { AlertCircle, Award, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import { CurationBookSummaryHeader } from './CurationBookSummaryHeader.js';
import { CurationVerdictSection } from './CurationVerdictSection.js';
import { CurationAlternativesSection } from './CurationAlternativesSection.js';
import { CurationAiAssistantBox } from './CurationAiAssistantBox.js';
import { ReviewStepTags } from '../review-modal/ReviewStepTags.js';
import { ReviewStepReservations } from '../review-modal/ReviewStepReservations.js';

function areStringArraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
}

function areReservationsEqual(a: ReservationItem[], b: ReservationItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, idx) => {
    const other = b[idx];
    return (
      item.topic === other.topic &&
      item.severity === other.severity &&
      item.description.trim() === other.description.trim() &&
      (item.reference?.trim() ?? '') === (other.reference?.trim() ?? '')
    );
  });
}

interface CurationEditorialEditorProps {
  book: BookDto;
  isSaving: boolean;
  feedback?: { type: 'success' | 'error'; text: string } | null;
  onSave: (payload: UpdateBookEditorialBody) => void;
}

export const CurationEditorialEditor: React.FC<CurationEditorialEditorProps> = ({
  book,
  isSaving,
  feedback = null,
  onSave,
}) => {
  const [editorialLock, setEditorialLock] = useState(book.editorialLock);
  const [adequacyStatus, setAdequacyStatus] = useState<AdequacyLevel>(
    book.adequacyStatus === 'UNRATED' ? 'RECOMMENDED' : book.adequacyStatus,
  );
  const [recommendedAge, setRecommendedAge] = useState<AgeRating>(book.recommendedAge);
  const [hasImprimatur, setHasImprimatur] = useState(book.hasImprimatur);
  const [editorialSummary, setEditorialSummary] = useState(book.editorialSummary ?? '');
  const [tags, setTags] = useState<string[]>(book.tags ?? []);
  const [reservations, setReservations] = useState<ReservationItem[]>(book.reservations ?? []);
  const [alternativeIds, setAlternativeIds] = useState<string[]>(book.alternatives ?? []);
  const [localError, setLocalError] = useState<string | null>(null);

  const applyBookState = (target: BookDto) => {
    setEditorialLock(target.editorialLock);
    setAdequacyStatus(target.adequacyStatus === 'UNRATED' ? 'RECOMMENDED' : target.adequacyStatus);
    setRecommendedAge(target.recommendedAge);
    setHasImprimatur(target.hasImprimatur);
    setEditorialSummary(target.editorialSummary ?? '');
    setTags(target.tags ?? []);
    setReservations(target.reservations ?? []);
    setAlternativeIds(target.alternatives ?? []);
    setLocalError(null);
  };

  useEffect(() => {
    applyBookState(book);
  }, [book]);

  const handleReset = () => {
    applyBookState(book);
  };

  const trimmedLength = editorialSummary.trim().length;
  const isOverLimit = trimmedLength > 2500;
  const savedAlternatives = book.alternatives ?? [];
  const alternativesChanged = !areStringArraysEqual(alternativeIds, savedAlternatives);
  const tagsChanged = !areStringArraysEqual(tags, book.tags ?? []);
  const reservationsChanged = !areReservationsEqual(reservations, book.reservations ?? []);
  const initialAdequacy: AdequacyLevel =
    book.adequacyStatus === 'UNRATED' ? 'RECOMMENDED' : book.adequacyStatus;
  const hasEditorialChanges =
    editorialLock !== book.editorialLock ||
    hasImprimatur !== book.hasImprimatur ||
    editorialSummary.trim() !== (book.editorialSummary ?? '').trim() ||
    alternativesChanged ||
    (editorialLock &&
      (adequacyStatus !== initialAdequacy ||
        recommendedAge !== book.recommendedAge ||
        tagsChanged ||
        reservationsChanged));
  const isDirty = hasEditorialChanges;
  const canReset = !isSaving && hasEditorialChanges;
  const canSave = !isSaving && hasEditorialChanges && !isOverLimit;

  const handleSaveClick = () => {
    if (isOverLimit) {
      setLocalError(
        `A síntese editorial possui ${trimmedLength} caracteres e excede o limite máximo de 2500 caracteres.`,
      );
      return;
    }

    const normalizedReservations = reservations.map((item) => ({
      ...item,
      description: item.description.trim(),
      reference: item.reference?.trim() || undefined,
    }));

    if (
      editorialLock &&
      normalizedReservations.some((item) => item.description.length < 10)
    ) {
      setLocalError(
        'Cada ponto de atenção deve ter uma justificativa com pelo menos 10 caracteres.',
      );
      return;
    }

    setLocalError(null);
    onSave({
      editorialLock,
      adequacyStatus,
      recommendedAge,
      hasImprimatur,
      editorialSummary: editorialSummary.trim() || undefined,
      ...(editorialLock
        ? {
            tags: tags.map((tag) => tag.trim()).filter(Boolean),
            reservations: normalizedReservations,
          }
        : {}),
      alternatives: alternativeIds,
    });
  };

  return (
    <div className="bg-surface-container-lowest border border-outline/15 rounded-xl shadow-2xs p-5 sm:p-6 flex flex-col gap-6">
      <CurationBookSummaryHeader book={book} />

      <CurationVerdictSection
        editorialLock={editorialLock}
        adequacyStatus={adequacyStatus}
        recommendedAge={recommendedAge}
        onToggleLock={() => setEditorialLock((prev) => !prev)}
        onChangeAdequacy={setAdequacyStatus}
        onChangeAge={setRecommendedAge}
      />

      <section className="p-4 rounded-xl bg-surface-container-low border border-outline/15 flex flex-col gap-5">
        {!editorialLock && (
          <p className="text-xs text-on-surface-variant bg-surface-container-lowest border border-outline/15 rounded-lg px-3 py-2">
            Ative a <strong>Trava Editorial Oficial</strong> acima para editar os temas, tags e pontos de atenção oficiais caso discorde do consenso comunitário.
          </p>
        )}

        <ReviewStepTags
          selectedTags={tags}
          onChangeTags={(nextTags) => {
            setLocalError(null);
            setTags(nextTags);
          }}
          disabled={!editorialLock}
          hideStepLabel
          title="Temas & Marcadores Oficiais"
          subtitle="Defina as tags temáticas exibidas na ficha pública da obra quando a Trava Editorial estiver ativa."
        />

        <div className="border-t border-outline/15 pt-4">
          <ReviewStepReservations
            adequacyVote={adequacyStatus === 'UNRATED' ? 'RECOMMENDED' : adequacyStatus}
            reservations={reservations}
            onChangeReservations={(nextReservations) => {
              setLocalError(null);
              setReservations(nextReservations);
            }}
            disabled={!editorialLock}
            hideStepLabel
            title="Pontos de Inadequação & Ressalvas Oficiais"
            subtitle="Ajuste, adicione ou remova ressalvas oficiais para manter a ficha do livro coerente com o veredito da curadoria."
          />
        </div>
      </section>

      <section className="p-4 rounded-xl bg-surface-container-low border border-outline/15 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-primary">
              Chancela Eclesiástica (Imprimatur / Nihil Obstat)
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Marque apenas se a edição possuir aprovação oficial da autoridade eclesiástica competente.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={hasImprimatur}
          onClick={() => setHasImprimatur((prev) => !prev)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            hasImprimatur ? 'bg-secondary' : 'bg-outline/40'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform ${
              hasImprimatur ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </section>

      <CurationAiAssistantBox
        bookId={book._id}
        onApplyDraft={(draftText) => {
          setLocalError(null);
          setEditorialSummary(draftText);
        }}
      />

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-primary">
            Síntese do Curador-Chefe (editorialSummary)
          </label>
          <span
            className={`text-[11px] font-semibold ${
              isOverLimit ? 'text-error' : 'text-on-surface-variant'
            }`}
          >
            {editorialSummary.length} / 2500 caracteres
          </span>
        </div>
        <textarea
          rows={5}
          maxLength={2500}
          value={editorialSummary}
          onChange={(e) => {
            setLocalError(null);
            setEditorialSummary(e.target.value);
          }}
          placeholder="Redija o parecer pastoral e literário oficial que aparecerá em destaque na ficha da obra..."
          className="w-full p-3.5 rounded-xl bg-surface-container-low border border-outline/25 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
        />
      </section>

      <CurationAlternativesSection
        bookId={book._id}
        alternativeIds={alternativeIds}
        onAdd={(altId) => {
          if (altId !== book._id && !alternativeIds.includes(altId) && alternativeIds.length < 10) {
            setAlternativeIds((prev) => [...prev, altId]);
          }
        }}
        onRemove={(altId) => setAlternativeIds((prev) => prev.filter((id) => id !== altId))}
      />

      {(localError || feedback) && (
        <div
          className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2 ${
            localError || feedback?.type === 'error'
              ? 'bg-error-container/70 border-error/30 text-on-error-container'
              : 'bg-success-container/60 border-success/30 text-success'
          }`}
        >
          {localError || feedback?.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{localError ?? feedback?.text}</span>
        </div>
      )}

      <div className="pt-4 border-t border-outline/15 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={!canReset}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          Descartar Alterações
        </button>

        <button
          type="button"
          disabled={!canSave}
          onClick={handleSaveClick}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Save className="w-4 h-4 text-secondary-container" />
          {isSaving
            ? 'Salvando Parecer...'
            : !isDirty && feedback?.type === 'success'
              ? 'Parecer Salvo'
              : 'Salvar Parecer Oficial'}
        </button>
      </div>
    </div>
  );
};
