import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { CreateSuggestionBody } from '@app/shared';
import { Home, Info, Sparkles } from 'lucide-react';
import { api, ApiError } from '../services/api.js';
import { SuggestionForm } from '../components/domain/suggestions/SuggestionForm.js';

export const SuggestionsPage: React.FC = () => {
  const mutation = useMutation({
    mutationFn: (payload: CreateSuggestionBody) => api.createSuggestion(payload),
  });

  const errorMessage = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : 'Não foi possível enviar sua sugestão.'
    : null;

  return (
    <div className="pt-[96px] sm:pt-[116px] pb-16 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <nav aria-label="Navegação Estrutural" className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-semibold">Enviar Sugestões</span>
        </nav>

        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-primary tracking-tight mt-1">
          Enviar Sugestões
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl">
          Indique livros para análise da curadoria ou compartilhe sugestões de melhoria para o Veritas Libris.
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

        <aside className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Info className="w-4 h-4 text-secondary" />
              <span>O que acontece após o envio?</span>
            </div>
            <ol className="text-xs sm:text-sm text-on-surface-variant space-y-2 list-decimal list-inside leading-relaxed">
              <li>Sua indicação é registrada na fila da equipe curatorial.</li>
              <li>Se for uma obra com ISBN válido, ela é priorizada para catalogação e parecer.</li>
              <li>Sugestões da plataforma entram no backlog de melhorias contínuas.</li>
            </ol>
          </div>

          <div className="bg-surface-container-low border border-outline/15 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Dica rápida</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Se você já estiver logado e tiver o título ou ISBN em mãos, também pode importar o livro diretamente pelo botão <strong>Avaliar / Importar</strong> no topo da página.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
