import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import type { AdequacyLevel, AgeRating, BookStampFilter } from '@app/shared';
import { FamilyModeWidget } from '../components/domain/FamilyModeWidget.js';
import {
  CatalogFilters,
  type SortOption,
  type ViewMode,
} from '../components/domain/CatalogFilters.js';
import { BookCard } from '../components/domain/BookCard.js';
import { BookCardSkeleton } from '../components/ui/BookCardSkeleton.js';
import { MethodologySection } from '../components/domain/MethodologySection.js';
import { BookX, ChevronLeft, ChevronRight } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = searchParams.get('q') || '';
  const initialAdequacy = (searchParams.get('adequacy') as AdequacyLevel) || undefined;
  const initialAge = (searchParams.get('age') as AgeRating) || undefined;
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialFamilyMode = searchParams.get('familyMode') === 'true';
  const initialStamp = (searchParams.get('stamp') as BookStampFilter) || undefined;
  const initialSort = (searchParams.get('sort') as SortOption) || 'most-reviewed';

  const [q, setQ] = useState(initialQ);
  const [adequacy, setAdequacy] = useState<AdequacyLevel | undefined>(initialAdequacy);
  const [age, setAge] = useState<AgeRating | undefined>(initialAge);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [stamp, setStamp] = useState<string | undefined>(initialStamp);
  const [page, setPage] = useState(initialPage);
  const [isFamilyMode, setIsFamilyMode] = useState(initialFamilyMode);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (adequacy) params.set('adequacy', adequacy);
    if (age) params.set('age', age);
    if (isFamilyMode) params.set('familyMode', 'true');
    if (stamp) params.set('stamp', stamp);
    if (sortBy !== 'most-reviewed') params.set('sort', sortBy);
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [q, adequacy, age, isFamilyMode, stamp, sortBy, page, setSearchParams]);

  const effectiveQuery = useMemo(() => {
    if (category) {
      return q ? `${q} ${category}` : category;
    }
    return q || undefined;
  }, [q, category]);

  const stampFilter =
    stamp === 'imprimatur' || stamp === 'classico-cristao' ? stamp : undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'books',
      { q: effectiveQuery, adequacy, age, familyMode: isFamilyMode, stamp: stampFilter, sort: sortBy, page },
    ],
    queryFn: () =>
      api.getBooks({
        q: effectiveQuery,
        adequacy,
        age,
        familyMode: isFamilyMode || undefined,
        stamp: stampFilter,
        sort: sortBy,
        page,
        limit: 12,
      }),
    staleTime: 15_000,
    refetchOnMount: 'always',
  });

  const displayedBooks = data?.items ?? [];

  const handleResetFilters = () => {
    setQ('');
    setAdequacy(undefined);
    setAge(undefined);
    setCategory(undefined);
    setStamp(undefined);
    setIsFamilyMode(false);
    setPage(1);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="pt-[96px] sm:pt-[108px] w-full">
        <FamilyModeWidget
          isFamilyMode={isFamilyMode}
          onToggleFamilyMode={(val) => {
            setIsFamilyMode(val);
            setPage(1);
          }}
          totalBooks={data?.stats.totalAll ?? data?.total ?? 0}
          reviewedBooks={data?.stats.reviewed ?? 0}
        />
      </div>

      <CatalogFilters
        selectedAdequacy={adequacy}
        onSelectAdequacy={(val) => {
          setAdequacy(val);
          setPage(1);
        }}
        selectedAge={age}
        onSelectAge={(val) => {
          setAge(val);
          setPage(1);
        }}
        selectedCategory={category}
        onSelectCategory={(val) => {
          setCategory(val);
          setPage(1);
        }}
        selectedStamp={stamp}
        onSelectStamp={(val) => {
          setStamp(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetFilters={handleResetFilters}
        counts={{
          all: data?.stats.totalAll ?? 0,
          recommended: data?.stats.recommended ?? 0,
          withReservations: data?.stats.withReservations ?? 0,
          notRecommended: data?.stats.notRecommended ?? 0,
        }}
      />

      <main className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b border-outline/15">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-primary">
              Catálogo Geral
            </span>
            <span className="text-xs text-outline">
              Exibindo {displayedBooks.length} de {data?.total ?? 0} análises pastorais
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>Critério Ativo:</span>
            <span className="font-semibold text-secondary">
              Magistério & Moral Ortodoxa
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-error-container/20 border border-error/20 rounded-2xl">
            <p className="text-sm text-error font-bold">Erro ao carregar o catálogo de obras.</p>
            <p className="text-xs text-outline mt-1">{(error as any)?.message}</p>
          </div>
        ) : displayedBooks.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-surface-container-low rounded-2xl border border-outline/10 p-8">
            <BookX className="w-12 h-12 text-outline mx-auto stroke-[1.2]" />
            <h3 className="font-editorial text-lg font-bold text-on-surface">
              Nenhuma obra localizada
            </h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Nenhum livro no acervo corresponde aos critérios selecionados. Experimente limpar os filtros ou utilizar o botão superior para importar novas obras.
            </p>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {displayedBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-outline/15">
                <div className="text-xs text-on-surface-variant">
                  Página <strong className="text-primary">{page}</strong> de {data.totalPages} páginas
                </div>

                <nav aria-label="Navegação de Páginas" className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(5, data.totalPages) }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'hover:bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {data.totalPages > 5 && (
                    <>
                      <span className="px-1 text-outline text-xs">...</span>
                      <button
                        type="button"
                        onClick={() => setPage(data.totalPages)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold hover:bg-surface-container text-on-surface-variant transition-colors ${
                          page === data.totalPages ? 'bg-primary text-on-primary' : ''
                        }`}
                      >
                        {data.totalPages}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

      </main>

      <MethodologySection />
    </div>
  );
};
