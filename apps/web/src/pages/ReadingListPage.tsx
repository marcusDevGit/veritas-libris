import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdequacyLevel } from '@app/shared';
import { Bookmark, ChevronDown, Compass, Home, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import { ReadingListCard } from '../components/domain/reading-list/ReadingListCard.js';

type ListFilter = 'ALL' | AdequacyLevel | 'IMPRIMATUR';
type ListSort = 'recent' | 'title' | 'year';

export const ReadingListPage: React.FC = () => {
  const { user, isLoading: authLoading, openAuthModal } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ListFilter>('ALL');
  const [sortBy, setSortBy] = useState<ListSort>('recent');

  const listQuery = useQuery({
    queryKey: ['reading-list'],
    queryFn: () => api.getReadingList(),
    enabled: Boolean(user),
    staleTime: 10_000,
    refetchOnMount: 'always',
  });

  const removeMutation = useMutation({
    mutationFn: (bookId: string) => api.removeFromReadingList(bookId),
    onSuccess: (_res, bookId) => {
      queryClient.invalidateQueries({ queryKey: ['reading-list'] });
      queryClient.invalidateQueries({ queryKey: ['reading-list-status', bookId] });
    },
  });

  const filteredItems = useMemo(() => {
    const raw = listQuery.data?.items ?? [];
    const q = searchTerm.trim().toLowerCase();

    const filtered = raw.filter(({ book }) => {
      if (filter === 'IMPRIMATUR' && !book.hasImprimatur) return false;
      if (
        filter !== 'ALL' &&
        filter !== 'IMPRIMATUR' &&
        book.adequacyStatus !== filter
      ) {
        return false;
      }

      if (q.length > 0) {
        const haystack = `${book.title} ${book.authors.join(' ')} ${book.isbn13}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...filtered];
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.book.title.localeCompare(b.book.title));
    } else if (sortBy === 'year') {
      sorted.sort((a, b) => (b.book.publishedYear ?? 0) - (a.book.publishedYear ?? 0));
    }
    return sorted;
  }, [listQuery.data?.items, searchTerm, filter, sortBy]);

  if (authLoading) {
    return (
      <div className="pt-[108px] pb-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-48 rounded-2xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-[108px] pb-16 max-w-xl mx-auto px-4 text-center">
        <div className="bg-surface-container-lowest border border-outline/20 rounded-2xl p-8 shadow-xs">
          <Bookmark className="w-10 h-10 text-secondary mx-auto mb-3" />
          <h1 className="font-editorial text-2xl font-bold text-primary mb-2">
            Minha Lista de Leitura
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Entre com sua conta Google para salvar obras do catálogo e organizar sua estante pessoal de leitura futura.
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  const stats = listQuery.data?.stats ?? {
    total: 0,
    recommended: 0,
    withReservations: 0,
    notRecommended: 0,
    imprimatur: 0,
  };

  const chips: Array<{ value: ListFilter; label: string; count: number }> = [
    { value: 'ALL', label: 'Todos', count: stats.total },
    { value: 'RECOMMENDED', label: 'Recomendados', count: stats.recommended },
    { value: 'WITH_RESERVATIONS', label: 'Com Ressalvas', count: stats.withReservations },
    { value: 'NOT_RECOMMENDED', label: 'Não Recomendados', count: stats.notRecommended },
    { value: 'IMPRIMATUR', label: 'Com Imprimatur', count: stats.imprimatur },
  ];

  return (
    <div className="pt-28 sm:pt-[116px] pb-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span>Minha Estante</span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Minha Lista de Leitura</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Minha Lista de Leitura
              </h1>
              <span className="px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-xs font-bold border border-secondary/20">
                {stats.total} {stats.total === 1 ? 'obra salva' : 'obras salvas'}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">
              Obras selecionadas e salvas para leitura e discernimento futuro.
            </p>
          </div>

          <Link
            to="/"
            className="self-start sm:self-auto inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs sm:text-sm font-semibold border border-outline/20 transition-colors"
          >
            <Compass className="w-4 h-4 text-secondary" />
            Explorar Catálogo
          </Link>
        </div>
      </header>

      <section className="bg-surface-container-lowest border border-outline/15 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por título, autor ou ISBN..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-low border border-outline/20 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
            {chips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setFilter(chip.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === chip.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary'
                }`}
              >
                {chip.label} ({chip.count})
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              aria-label="Ordenar lista de leitura"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ListSort)}
              className="appearance-none h-9 pl-3 pr-8 rounded-lg bg-surface-container-low border border-outline/20 text-xs font-semibold text-on-surface cursor-pointer outline-none"
            >
              <option value="recent">Adicionados recentemente</option>
              <option value="title">Título (A–Z)</option>
              <option value="year">Ano de publicação</option>
            </select>
            <ChevronDown className="w-4 h-4 text-outline absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {listQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-surface-container-low border border-outline/15 rounded-2xl p-10 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-outline mx-auto stroke-[1.4]" />
          <h2 className="font-editorial text-lg font-bold text-primary">
            {stats.total === 0
              ? 'Sua lista de leitura ainda está vazia'
              : 'Nenhuma obra encontrada para este filtro'}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
            {stats.total === 0
              ? 'Abra qualquer obra no catálogo e clique em "Salvar na Lista de Leitura" para guardá-la aqui.'
              : 'Experimente limpar a busca ou selecionar outro filtro de veredito.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-container transition-colors"
            >
              <Compass className="w-4 h-4" />
              Ir para o Catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(({ book, addedAt }) => (
            <ReadingListCard
              key={book._id}
              book={book}
              addedAt={addedAt}
              isRemoving={removeMutation.isPending}
              onRemove={(bookId) => removeMutation.mutate(bookId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
