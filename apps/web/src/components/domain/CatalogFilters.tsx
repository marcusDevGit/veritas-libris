import React from 'react';
import type { AdequacyLevel, AgeRating } from '@app/shared';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LayoutGrid,
  List,
  FilterX,
  ChevronDown,
} from 'lucide-react';

export type SortOption = 'most-reviewed' | 'recent' | 'strict-moral' | 'alphabetical';
export type ViewMode = 'grid' | 'list';

export interface StatusCounts {
  all: number;
  recommended: number;
  withReservations: number;
  notRecommended: number;
}

export interface CatalogFiltersProps {
  selectedAdequacy?: AdequacyLevel;
  onSelectAdequacy: (adequacy?: AdequacyLevel) => void;
  selectedAge?: AgeRating;
  onSelectAge: (age?: AgeRating) => void;
  selectedCategory?: string;
  onSelectCategory: (category?: string) => void;
  selectedStamp?: string;
  onSelectStamp: (stamp?: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onResetFilters: () => void;
  counts?: StatusCounts;
}

const CATEGORIES = [
  'Ficção & Clássicos',
  'Teologia & Ascética',
  'Filosofia',
  'Infantojuvenil',
  'Distopias',
];

/**
 * CatalogFilters — Barra de Filtros e Facetas Editoriais do Catálogo
 * 
 * Implementa exatamente a estrutura em dois níveis do Stitch:
 * 1. Chips de veredito moral (Todos, Recomendado, Com Ressalvas, Desaconselhado) + Ordenação + Grid/List
 * 2. Facetas secundárias (Faixa Etária, Chancela Eclesiástica, Chips de Categorias, Limpar)
 */
export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  selectedAdequacy,
  onSelectAdequacy,
  selectedAge,
  onSelectAge,
  selectedCategory,
  onSelectCategory,
  selectedStamp,
  onSelectStamp,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  counts = { all: 2480, recommended: 1210, withReservations: 940, notRecommended: 330 },
}) => {
  const hasActiveFilters = Boolean(
    selectedAdequacy || selectedAge || selectedCategory || selectedStamp
  );

  return (
    <section className="sticky top-[107px] z-40 bg-surface/95 backdrop-blur-md py-4 px-6 lg:px-8 border-b border-outline/10 shadow-xs">
      <div className="max-w-[1380px] mx-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSelectAdequacy(undefined)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                !selectedAdequacy
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <span>Todos</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  !selectedAdequacy
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-outline'
                }`}
              >
                {counts.all.toLocaleString('pt-BR')}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectAdequacy(
                  selectedAdequacy === 'RECOMMENDED' ? undefined : 'RECOMMENDED'
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedAdequacy === 'RECOMMENDED'
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${
                  selectedAdequacy === 'RECOMMENDED' ? 'text-secondary-container' : 'text-secondary'
                }`}
              />
              <span>Recomendado</span>
              <span className="text-[10px] opacity-80">
                ({counts.recommended.toLocaleString('pt-BR')})
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectAdequacy(
                  selectedAdequacy === 'WITH_RESERVATIONS' ? undefined : 'WITH_RESERVATIONS'
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedAdequacy === 'WITH_RESERVATIONS'
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 ${
                  selectedAdequacy === 'WITH_RESERVATIONS'
                    ? 'text-secondary-container'
                    : 'text-secondary'
                }`}
              />
              <span>Com Ressalvas</span>
              <span className="text-[10px] opacity-80">
                ({counts.withReservations.toLocaleString('pt-BR')})
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectAdequacy(
                  selectedAdequacy === 'NOT_RECOMMENDED' ? undefined : 'NOT_RECOMMENDED'
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                selectedAdequacy === 'NOT_RECOMMENDED'
                  ? 'bg-error text-on-error font-bold shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <XCircle className="w-4 h-4 text-error" />
              <span>Desaconselhado</span>
              <span className="text-[10px] opacity-80">
                ({counts.notRecommended.toLocaleString('pt-BR')})
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <select
                aria-label="Ordenar livros"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-xs font-medium text-on-surface appearance-none focus:outline-none focus:ring-1 focus:ring-primary border border-outline/20 shadow-2xs cursor-pointer"
              >
                <option value="most-reviewed">Mais Avaliados</option>
                <option value="recent">Adições Recentes</option>
                <option value="strict-moral">Critério Moral Estrito</option>
                <option value="alphabetical">Ordem Alfabética (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-on-surface-variant" />
            </div>

            <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-outline/10">
              <button
                type="button"
                aria-label="Visualização em Grade"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-surface-container-lowest text-primary shadow-2xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Visualização em Lista"
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-surface-container-lowest text-primary shadow-2xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-outline/10">
          <span className="text-[10px] font-bold uppercase text-outline tracking-wider mr-1">
            Filtros:
          </span>

          <div className="relative">
            <select
              aria-label="Filtrar por Faixa Etária"
              value={selectedAge || ''}
              onChange={(e) => onSelectAge((e.target.value as AgeRating) || undefined)}
              className="h-8 pl-2.5 pr-7 rounded bg-surface-container text-xs text-on-surface appearance-none focus:outline-none cursor-pointer hover:bg-surface-container-high transition-colors border border-outline/10"
            >
              <option value="">Faixa Etária: Todas</option>
              <option value="ALL">Classificação Livre</option>
              <option value="10+">10+ anos</option>
              <option value="12+">12+ anos</option>
              <option value="14+">14+ anos</option>
              <option value="16+">16+ anos</option>
              <option value="18+">18+ anos</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 pointer-events-none text-on-surface-variant" />
          </div>

          <div className="relative">
            <select
              aria-label="Filtrar por Chancela Eclesiástica"
              value={selectedStamp || ''}
              onChange={(e) => onSelectStamp(e.target.value || undefined)}
              className="h-8 pl-2.5 pr-7 rounded bg-surface-container text-xs text-on-surface appearance-none focus:outline-none cursor-pointer hover:bg-surface-container-high transition-colors border border-outline/10"
            >
              <option value="">Chancela: Todas as Obras</option>
              <option value="imprimatur">Com Imprimatur / Nihil Obstat</option>
              <option value="classico-cristao">Clássicos da Tradição Cristã</option>
              <option value="secular">Literatura Secular Avaliada</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 pointer-events-none text-on-surface-variant" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(isActive ? undefined : cat)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-semibold'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="ml-auto text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
