import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { CreateSuggestionBody } from '@app/shared';
import { BookMarked, ExternalLink, Home, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '../services/api.js';
import { SuggestionForm } from '../components/domain/suggestions/SuggestionForm.js';
import { SuggestionsSidebar } from '../components/domain/suggestions/SuggestionsSidebar.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export const SuggestionsPage: React.FC = () => {
  usePageMeta(
    'Enviar Sugestões',
    'Indique obras literárias para exame da curadoria ou envie sugestões de melhoria para a plataforma Veritas Libris.',
  );

  const mutation = useMutation({
    mutationFn: (payload: CreateSuggestionBody) => api.createSuggestion(payload),
  });

  const errorMessage = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'Não foi possível enviar sua sugestão.'
    : null;

  return (
    <div className="pt-[96px] sm:pt-[116px] pb-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Enviar Sugestões</span>
        </nav>

        <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container text-[11px] font-bold uppercase tracking-widest mt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
          Contribuição dos Fiéis &amp; Leitores
        </span>

        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-primary tracking-tight mt-1">
          Enviar Sugestões
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-3xl">
          Indique livros para análise prudente da curadoria editorial ou envie recomendações de melhorias para a plataforma.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <SuggestionForm
            isSubmitting={mutation.isPending}
            isSuccess={mutation.isSuccess}
            errorMessage={errorMessage}
            onSubmit={(payload) => mutation.mutate(payload)}
            onResetSuccess={() => mutation.reset()}
          />
        </div>

        <div className="lg:col-span-5">
          <SuggestionsSidebar />
        </div>
      </div>

      <section className="p-5 rounded-xl bg-surface-container-low border border-outline/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-primary">
              Veritas Libris • Fidelitas, Prudentia, Sapientia
            </h3>
            <p className="text-xs text-on-surface-variant">
              Colaborando para o discernimento estético e moral na cultura leitora católica.
            </p>
          </div>
        </div>

        <Link
          to="/criterios"
          className="text-xs font-semibold text-primary hover:text-secondary inline-flex items-center gap-1.5 shrink-0"
        >
          <span>Ver Matriz de Critérios</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </section>
    </div>
  );
};
