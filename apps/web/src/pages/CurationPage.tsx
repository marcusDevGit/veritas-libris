import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BookDto, CurationFilter, UpdateBookEditorialBody } from '@app/shared';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Feather,
  Home,
  Lock,
  MessageSquarePlus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { api, ApiError } from '../services/api.js';
import { CurationKpiGrid } from '../components/domain/curation/CurationKpiGrid.js';
import { CurationBookQueue } from '../components/domain/curation/CurationBookQueue.js';
import { CurationEditorialEditor } from '../components/domain/curation/CurationEditorialEditor.js';
import { CurationSuggestionsPanel } from '../components/domain/curation/CurationSuggestionsPanel.js';

type CurationTab = 'queue' | 'suggestions';

export const CurationPage: React.FC = () => {
  const { user, profile, isCurator, isLoading: authLoading, signInWithGoogle } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<CurationTab>('queue');
  const [mobilePanel, setMobilePanel] = useState<'queue' | 'editor'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<CurationFilter>('all');
  const [selectedBook, setSelectedBook] = useState<BookDto | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const queueQuery = useQuery({
    queryKey: ['curation-books', searchTerm, filter],
    queryFn: () =>
      api.listCurationBooks({
        q: searchTerm.trim() || undefined,
        filter,
        limit: 30,
      }),
    enabled: Boolean(user && isCurator),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const suggestionsSummaryQuery = useQuery({
    queryKey: ['curation-suggestions', 'summary-count'],
    queryFn: () => api.listSuggestions({ status: 'PENDING', limit: 1 }),
    enabled: Boolean(user && isCurator),
  });

  useEffect(() => {
    const items = queueQuery.data?.items ?? [];
    if (items.length === 0) {
      setSelectedBook(null);
      return;
    }

    if (!selectedBook) {
      setSelectedBook(items[0]);
      return;
    }

    const refreshed = items.find((item) => item._id === selectedBook._id);
    if (refreshed) {
      setSelectedBook(refreshed);
    } else {
      setSelectedBook(items[0]);
    }
  }, [queueQuery.data?.items]);

  const saveEditorialMutation = useMutation({
    mutationFn: ({ bookId, body }: { bookId: string; body: UpdateBookEditorialBody }) =>
      api.updateBookEditorial(bookId, body),
    onSuccess: async (updated) => {
      setSelectedBook(updated);
      setFeedback({
        type: 'success',
        text: `Parecer oficial de "${updated.title}" salvo com sucesso.`,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['curation-books'] }),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['book', updated._id] }),
      ]);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : 'Não foi possível salvar o parecer editorial.';
      setFeedback({ type: 'error', text: message });
    },
  });

  if (authLoading) {
    return (
      <div className="pt-[108px] pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-48 rounded-2xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-[108px] pb-16 max-w-xl mx-auto px-4 text-center">
        <div className="bg-surface-container-lowest border border-outline/20 rounded-2xl p-8 shadow-xs">
          <Feather className="w-10 h-10 text-secondary mx-auto mb-3" />
          <h1 className="font-editorial text-2xl font-bold text-primary mb-2">
            Painel de Curadoria Oficial
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Faça login com sua conta autorizada de curador ou administrador para homologar pareceres.
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  if (!isCurator) {
    return (
      <div className="pt-[108px] pb-16 max-w-xl mx-auto px-4 text-center">
        <div className="bg-surface-container-lowest border border-outline/20 rounded-2xl p-8 shadow-xs">
          <Lock className="w-10 h-10 text-error mx-auto mb-3" />
          <h1 className="font-editorial text-2xl font-bold text-primary mb-2">
            Acesso Restrito ao Corpo de Curadores
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Apenas curadores nomeados ou administradores podem aplicar travas editoriais e chancelas.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-surface-container text-primary text-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const stats = queueQuery.data?.stats ?? {
    total: 0,
    pendingReview: 0,
    locked: 0,
    imprimatur: 0,
  };
  const books = queueQuery.data?.items ?? [];
  const pendingSuggestionsCount = suggestionsSummaryQuery.data?.stats.pending ?? 0;

  return (
    <div className="pt-28 sm:pt-[116px] pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span>Área Restrita</span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Painel de Curadoria Oficial</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="max-w-2xl">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Painel de Curadoria Oficial
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Homologação de vereditos, trava editorial (editorialLock), Imprimatur e triagem de sugestões.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary-container/50 text-on-secondary-container text-xs font-bold border border-secondary/20">
              <Feather className="w-3.5 h-3.5 text-secondary" />
              Acesso de Curador Oficial
            </span>
            <span className="inline-flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sessão Ativa: <strong className="text-on-surface">{profile?.name ?? user.displayName}</strong>
            </span>
            <Link
              to="/guia"
              className="text-xs font-semibold text-primary hover:text-secondary underline underline-offset-2"
            >
              Diretrizes da Curadoria
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-b border-outline/15">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors inline-flex items-center gap-2 cursor-pointer ${
              activeTab === 'queue'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>Fila Editorial</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors inline-flex items-center gap-2 cursor-pointer ${
              activeTab === 'suggestions'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Triagem de Sugestões</span>
            {pendingSuggestionsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-warning-container text-warning text-[10px] font-bold">
                {pendingSuggestionsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {activeTab === 'suggestions' ? (
        <CurationSuggestionsPanel />
      ) : (
        <>
          <CurationKpiGrid stats={stats} />

          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-sm flex items-center justify-between gap-3 ${
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
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs font-semibold underline cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`lg:col-span-5 ${mobilePanel === 'editor' ? 'hidden lg:block' : 'block'}`}>
              <CurationBookQueue
                books={books}
                stats={stats}
                selectedBookId={selectedBook?._id ?? null}
                searchTerm={searchTerm}
                filter={filter}
                isLoading={queueQuery.isLoading}
                onSearchChange={setSearchTerm}
                onFilterChange={setFilter}
                onSelectBook={(book) => {
                  setFeedback(null);
                  setSelectedBook(book);
                  setMobilePanel('editor');
                }}
              />
            </div>

            <div className={`lg:col-span-7 ${mobilePanel === 'queue' ? 'hidden lg:block' : 'block'}`}>
              {selectedBook ? (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setMobilePanel('queue')}
                    className="lg:hidden self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar para a Fila</span>
                  </button>
                  <CurationEditorialEditor
                    book={selectedBook}
                    isSaving={saveEditorialMutation.isPending}
                    feedback={feedback}
                    onSave={(body) =>
                      saveEditorialMutation.mutate({ bookId: selectedBook._id, body })
                    }
                  />
                </div>
              ) : (
                <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-10 text-center text-sm text-on-surface-variant">
                  Selecione uma obra na fila ao lado para editar o parecer oficial.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
