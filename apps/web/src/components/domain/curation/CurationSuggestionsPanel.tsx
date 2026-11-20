import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  SuggestionStatus,
  SuggestionType,
  UpdateSuggestionStatusBody,
} from '@app/shared';
import { AlertCircle, CheckCircle2, Inbox, Search } from 'lucide-react';
import { api, ApiError } from '../../../services/api.js';
import { SuggestionTriageCard } from './SuggestionTriageCard.js';

type StatusFilter = 'ALL' | SuggestionStatus;
type TypeFilter = 'ALL' | SuggestionType;

export const CurationSuggestionsPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    importedBookId?: string;
  } | null>(null);

  const suggestionsQuery = useQuery({
    queryKey: ['curation-suggestions', statusFilter, typeFilter, searchTerm],
    queryFn: () =>
      api.listSuggestions({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        q: searchTerm.trim() || undefined,
        limit: 50,
      }),
    staleTime: 0,
  });

  const invalidateRelated = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['curation-suggestions'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-audit-logs'] }),
    ]);
  };

  const triageMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSuggestionStatusBody }) =>
      api.triageSuggestion(id, body),
    onSuccess: async (updated) => {
      setFeedback({
        type: 'success',
        text: `Sugestão "${updated.title}" atualizada com sucesso.`,
      });
      await invalidateRelated();
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Não foi possível atualizar a sugestão.',
      });
    },
  });

  const importBookMutation = useMutation({
    mutationFn: async ({ isbn13, suggestionId }: { isbn13: string; suggestionId: string }) => {
      const imported = await api.importBook(isbn13);
      await api.triageSuggestion(suggestionId, {
        status: 'ACCEPTED',
        resolutionNote: `Obra ${imported.created ? 'importada' : 'localizada'} no catálogo (ISBN ${isbn13}).`,
      });
      return imported;
    },
    onSuccess: async (imported) => {
      setFeedback({
        type: 'success',
        text: `Obra "${imported.book.title}" ${imported.created ? 'importada ao catálogo' : 'já presente no catálogo'} e sugestão marcada como aceita.`,
        importedBookId: imported.book._id,
      });
      await Promise.all([
        invalidateRelated(),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['curation-books'] }),
      ]);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        text:
          err instanceof ApiError
            ? err.message
            : 'Não foi possível importar o livro pelo ISBN informado.',
      });
    },
  });

  const stats = suggestionsQuery.data?.stats ?? {
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    dismissed: 0,
  };
  const items = suggestionsQuery.data?.items ?? [];
  const isBusy = triageMutation.isPending || importBookMutation.isPending;

  const statusTabs: Array<{ key: StatusFilter; label: string; count: number }> = [
    { key: 'PENDING', label: 'Pendentes', count: stats.pending },
    { key: 'REVIEWED', label: 'Em análise', count: stats.reviewed },
    { key: 'ACCEPTED', label: 'Aceitas', count: stats.accepted },
    { key: 'DISMISSED', label: 'Descartadas', count: stats.dismissed },
    { key: 'ALL', label: 'Todas', count: stats.total },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    active ? 'bg-on-primary/20 text-on-primary' : 'bg-surface text-primary'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <select
            aria-label="Filtrar por tipo de sugestão"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="h-9 px-3 rounded-lg bg-surface border border-outline/25 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">Todos os tipos</option>
            <option value="BOOK">Indicações de obras</option>
            <option value="IMPROVEMENT">Melhorias / Correções</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar título, autor, ISBN..."
              className="h-9 pl-8 pr-3 w-full sm:w-56 rounded-lg bg-surface border border-outline/25 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex flex-wrap items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-success-container/60 border-success/30 text-success'
              : 'bg-error-container/70 border-error/30 text-on-error-container'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <div className="flex items-center gap-3">
            {feedback.importedBookId && (
              <Link
                to={`/livros/${feedback.importedBookId}`}
                className="text-xs font-bold underline hover:opacity-80"
              >
                Ver obra importada
              </Link>
            )}
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs font-semibold underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {suggestionsQuery.isLoading ? (
        <div className="space-y-3">
          <div className="h-36 rounded-xl bg-surface-container animate-pulse" />
          <div className="h-36 rounded-xl bg-surface-container animate-pulse" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-10 text-center flex flex-col items-center gap-2">
          <Inbox className="w-8 h-8 text-outline" />
          <p className="text-sm font-semibold text-primary">
            Nenhuma sugestão encontrada neste filtro.
          </p>
          <p className="text-xs text-on-surface-variant">
            As indicações enviadas pelo formulário público aparecem aqui para triagem da curadoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <SuggestionTriageCard
              key={item.id}
              suggestion={item}
              isBusy={isBusy}
              onTriage={(id, status, resolutionNote) =>
                triageMutation.mutate({
                  id,
                  body: { status, resolutionNote: resolutionNote?.trim() || undefined },
                })
              }
              onImportBook={(isbn13, suggestionId) =>
                importBookMutation.mutate({ isbn13, suggestionId })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
