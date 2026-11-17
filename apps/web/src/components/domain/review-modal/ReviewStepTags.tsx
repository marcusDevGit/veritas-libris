import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';

export interface ReviewStepTagsProps {
  selectedTags: string[];
  onChangeTags: (tags: string[]) => void;
}

const SUGGESTED_TAGS = [
  'Literatura Universal',
  'Virtudes Cristãs',
  'Redenção & Graça',
  'Apologética',
  'Niilismo / Existencialismo',
  'Violência Dramática',
  'Anticlericalismo',
  'Sensualidade Explícita',
  'Ocultismo / Esoterismo',
  'Formação Familiar',
];

/**
 * ReviewStepTags — Etapa 2: Marcadores Temáticos & Doutrinários
 *
 * Permite marcar chaves hermenêuticas sugeridas e adicionar tags personalizadas,
 * reproduzindo os chips pílula do Stitch.
 */
export const ReviewStepTags: React.FC<ReviewStepTagsProps> = ({
  selectedTags,
  onChangeTags,
}) => {
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChangeTags(selectedTags.filter((t) => t !== tag));
    } else {
      onChangeTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const cleaned = customTag.trim();
    if (!cleaned || selectedTags.includes(cleaned)) {
      setCustomTag('');
      return;
    }
    onChangeTags([...selectedTags, cleaned]);
    setCustomTag('');
  };

  const allDisplayTags = Array.from(new Set([...SUGGESTED_TAGS, ...selectedTags]));

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          Etapa 2
        </span>
        <span className="text-outline text-xs">•</span>
        <h3 className="font-editorial text-lg font-bold text-primary">
          Marcadores Temáticos & Doutrinários
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-on-surface-variant -mt-2">
        Selecione as principais chaves hermenêuticas presentes no texto para auxiliar a busca pastoral.
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        {allDisplayTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>{tag}</span>
              {isSelected ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          );
        })}
      </div>

      <div className="relative w-full max-w-md pt-1 flex gap-2">
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomTag();
            }
          }}
          placeholder="+ Adicionar tag personalizada ou referência..."
          className="flex-1 h-10 px-4 rounded-lg bg-surface-container-lowest border border-outline/20 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container shadow-2xs"
        />
        {customTag.trim() && (
          <button
            type="button"
            onClick={handleAddCustomTag}
            className="px-3 h-10 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            Adicionar
          </button>
        )}
      </div>
    </section>
  );
};
