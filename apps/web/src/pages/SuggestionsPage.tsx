import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import type { CreateSuggestionBody } from '@app/shared';
import { Home, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { api, ApiError } from '../services/api.js';
import { SuggestionForm } from '../components/domain/suggestions/SuggestionForm.js';

const PROCESS_STEPS = [
  {
    step: '1',
    title: 'Recebimento & Protocolo',
    desc: 'Sua indicação é registrada diretamente na fila de sugestões do sistema.',
  },
  {
    step: '2',
    title: 'Triagem pela Curadoria Oficial',
    desc: 'Curadores avaliam relevância pastoral, ISBN e prioridade temática.',
  },
  {
    step: '3',
    title: 'Catalogação ou Parecer',
    desc: 'A obra passa a integrar o acervo para análise e discernimento público.',
  },
];

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
          Formulário de indicação de livros para exame pastoral ou sugestões de melhoria na plataforma.
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
          <div className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Info className="w-4 h-4 text-secondary" />
              <span>O que acontece após o envio?</span>
            </div>
            <div className="space-y-3">
              {PROCESS_STEPS.map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-primary">{item.title}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline/15 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>Prioridades de Exame Pastoral</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Obras infantojuvenis, clássicos escolares e lançamentos de grande circulação recebem prioridade na fila curatorial.
            </p>
          </div>

          <div className="bg-surface-container-low border border-outline/15 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Dica rápida</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Se você estiver logado e tiver o título ou ISBN, também pode importar a obra diretamente pelo botão <strong>Avaliar / Importar</strong> no topo.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
