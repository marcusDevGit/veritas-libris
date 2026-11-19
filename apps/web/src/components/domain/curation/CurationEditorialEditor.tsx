import React, { useEffect, useState } from 'react';
import type {
  AdequacyLevel,
  AgeRating,
  BookDto,
  UpdateBookEditorialBody,
} from '@app/shared';
import { Award, RotateCcw, Save } from 'lucide-react';
import { CurationBookSummaryHeader } from './CurationBookSummaryHeader.js';
import { CurationVerdictSection } from './CurationVerdictSection.js';
import { CurationAlternativesSection } from './CurationAlternativesSection.js';

interface CurationEditorialEditorProps {
  book: BookDto;
  isSaving: boolean;
  onSave: (payload: UpdateBookEditorialBody) => void;
}

export const CurationEditorialEditor: React.FC<CurationEditorialEditorProps> = ({
  book,
  isSaving,
  onSave,
}) => {
  const [editorialLock, setEditorialLock] = useState(book.editorialLock);
  const [adequacyStatus, setAdequacyStatus] = useState<AdequacyLevel>(
    book.adequacyStatus === 'UNRATED' ? 'RECOMMENDED' : book.adequacyStatus,
  );
  const [recommendedAge, setRecommendedAge] = useState<AgeRating>(book.recommendedAge);
  const [hasImprimatur, setHasImprimatur] = useState(book.hasImprimatur);
  const [editorialSummary, setEditorialSummary] = useState(book.editorialSummary ?? '');
  const [alternativeIds, setAlternativeIds] = useState<string[]>(book.alternatives ?? []);

  useEffect(() => {
    setEditorialLock(book.editorialLock);
    setAdequacyStatus(book.adequacyStatus === 'UNRATED' ? 'RECOMMENDED' : book.adequacyStatus);
    setRecommendedAge(book.recommendedAge);
    setHasImprimatur(book.hasImprimatur);
    setEditorialSummary(book.editorialSummary ?? '');
    setAlternativeIds(book.alternatives ?? []);
  }, [book]);

  const handleReset = () => {
    setEditorialLock(book.editorialLock);
    setAdequacyStatus(book.adequacyStatus === 'UNRATED' ? 'RECOMMENDED' : book.adequacyStatus);
    setRecommendedAge(book.recommendedAge);
    setHasImprimatur(book.hasImprimatur);
    setEditorialSummary(book.editorialSummary ?? '');
    setAlternativeIds(book.alternatives ?? []);
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

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-primary">
            Síntese do Curador-Chefe (editorialSummary)
          </label>
          <span className="text-[11px] text-on-surface-variant">
            {editorialSummary.length} / 2500 caracteres
          </span>
        </div>
        <textarea
          rows={5}
          maxLength={2500}
          value={editorialSummary}
          onChange={(e) => setEditorialSummary(e.target.value)}
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

      <div className="pt-4 border-t border-outline/15 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Descartar Alterações
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() =>
            onSave({
              editorialLock,
              adequacyStatus,
              recommendedAge,
              hasImprimatur,
              editorialSummary: editorialSummary.trim() || undefined,
              alternatives: alternativeIds,
            })
          }
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4 text-secondary-container" />
          {isSaving ? 'Salvando Parecer...' : 'Salvar Parecer Oficial'}
        </button>
      </div>
    </div>
  );
};
