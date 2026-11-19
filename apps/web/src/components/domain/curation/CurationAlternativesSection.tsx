import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { api } from '../../../services/api.js';

interface CurationAlternativesSectionProps {
  bookId: string;
  alternativeIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export const CurationAlternativesSection: React.FC<CurationAlternativesSectionProps> = ({
  bookId,
  alternativeIds,
  onAdd,
  onRemove,
}) => {
  const [search, setSearch] = useState('');

  const altSearchQuery = useQuery({
    queryKey: ['curation-alt-search', search],
    queryFn: () => api.getBooks({ q: search.trim(), limit: 6 }),
    enabled: search.trim().length >= 2,
  });

  const suggestions = (altSearchQuery.data?.items ?? []).filter(
    (item) => item._id !== bookId && !alternativeIds.includes(item._id),
  );

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-bold text-primary">Obras Alternativas Recomendadas</h3>
        <p className="text-xs text-on-surface-variant">
          Vincule obras do catálogo sugeridas como alternativas edificantes ou complementares.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar obra no catálogo para vincular (mín. 2 letras)..."
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low border border-outline/20 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
        />

        {search.trim().length >= 2 && suggestions.length > 0 && (
          <div className="mt-1.5 rounded-lg border border-outline/20 bg-surface-container-lowest shadow-md divide-y divide-outline/10 max-h-48 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => {
                  onAdd(item._id);
                  setSearch('');
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-low flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="font-semibold text-primary truncate">{item.title}</span>
                <span className="text-on-surface-variant shrink-0">
                  + Vincular ({item.isbn13})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {alternativeIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alternativeIds.map((altId) => (
            <span
              key={altId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-xs font-semibold text-primary border border-outline/20"
            >
              ID: {altId.slice(-6)}
              <button
                type="button"
                onClick={() => onRemove(altId)}
                aria-label={`Remover alternativa ${altId}`}
                className="text-on-surface-variant hover:text-error cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
