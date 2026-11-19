import React, { useState } from 'react';
import type { CreateSuggestionBody, SuggestionType } from '@app/shared';
import {
  Barcode,
  BookOpen,
  CheckCircle2,
  Feather,
  Lightbulb,
  RotateCcw,
  Send,
  User,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext.js';

interface SuggestionFormProps {
  isSubmitting: boolean;
  isSuccess: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: CreateSuggestionBody) => void;
  onResetSuccess: () => void;
}

export const SuggestionForm: React.FC<SuggestionFormProps> = ({
  isSubmitting,
  isSuccess,
  errorMessage,
  onSubmit,
  onResetSuccess,
}) => {
  const { user } = useAuth();
  const [type, setType] = useState<SuggestionType>('BOOK');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn13, setIsbn13] = useState('');
  const [senderName, setSenderName] = useState(user?.displayName ?? '');
  const [senderEmail, setSenderEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [accepted, setAccepted] = useState(true);

  const handleClear = () => {
    setTitle('');
    setAuthor('');
    setIsbn13('');
    setMessage('');
    onResetSuccess();
  };

  if (isSuccess) {
    return (
      <div className="bg-surface-container-lowest border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
        <CheckCircle2 className="w-11 h-11 text-emerald-700 mx-auto" />
        <h2 className="font-editorial text-xl font-bold text-primary">
          Sugestão Registrada com Sucesso!
        </h2>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          Obrigado por contribuir com o Veritas Libris. Nossa equipe curatorial analisará sua indicação em breve.
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="h-10 px-5 rounded-lg bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
        >
          Enviar outra sugestão
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      title: title.trim(),
      author: type === 'BOOK' ? author.trim() || undefined : undefined,
      isbn13: type === 'BOOK' ? isbn13.trim() || undefined : undefined,
      senderName: senderName.trim() || undefined,
      senderEmail: senderEmail.trim() || undefined,
      message: message.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest border border-outline/15 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5"
    >
      <div className="flex items-start justify-between pb-3 border-b border-outline/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-editorial text-base sm:text-lg font-bold text-primary">
              Formulário de Indicação Eclesial
            </h2>
            <p className="text-xs text-on-surface-variant">
              Preencha os campos para triagem pastoral ou aperfeiçoamento técnico.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-bold uppercase text-outline bg-surface-container-low px-2 py-1 rounded">
          PROTOCOLO PÚBLICO
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setType('BOOK')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            type === 'BOOK'
              ? 'border-primary bg-primary/5'
              : 'border-outline/20 bg-surface-container-low hover:border-primary/40'
          }`}
        >
          <BookOpen className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-bold text-primary">Sugerir Livro</p>
            <p className="text-[11px] text-on-surface-variant">Indicar obra para curadoria</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setType('IMPROVEMENT')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            type === 'IMPROVEMENT'
              ? 'border-primary bg-primary/5'
              : 'border-outline/20 bg-surface-container-low hover:border-primary/40'
          }`}
        >
          <Lightbulb className="w-5 h-5 text-secondary shrink-0" />
          <div>
            <p className="text-xs font-bold text-primary">Melhoria da Plataforma</p>
            <p className="text-[11px] text-on-surface-variant">Filtros, UX ou recursos</p>
          </div>
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-primary mb-1">
          {type === 'BOOK' ? 'Título da Obra Sugerida *' : 'Assunto da Melhoria *'}
        </label>
        <div className="relative">
          <BookOpen className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            required
            minLength={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === 'BOOK' ? 'Ex: Os Irmãos Karamázov' : 'Ex: Filtro por editora católica'
            }
            className="w-full h-10 pl-9 pr-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
          />
        </div>
      </div>

      {type === 'BOOK' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Autor</label>
            <div className="relative">
              <User className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Fiódor Dostoiévski"
                className="w-full h-10 pl-9 pr-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-primary mb-1">ISBN-13 (opcional)</label>
            <div className="relative">
              <Barcode className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={isbn13}
                onChange={(e) => setIsbn13(e.target.value)}
                placeholder="978..."
                className="w-full h-10 pl-9 pr-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
            Seu Nome (opcional)
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Como podemos identificá-lo"
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline/20 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
            E-mail para Retorno (opcional)
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="nome@exemplo.com"
            className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest border border-outline/20 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-primary">
            Justificativa &amp; Detalhes *
          </label>
          <span className="text-[11px] text-outline">{message.length} / 2000 caracteres</span>
        </div>
        <textarea
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Descreva os motivos pastorais para a inclusão da obra ou os detalhes da melhoria..."
          className="w-full p-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
        />
      </div>

      <label className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-container-high/40 text-xs text-on-surface-variant cursor-pointer">
        <input
          type="checkbox"
          required
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 rounded text-primary"
        />
        <span>
          Declaro que a indicação busca contribuir com o discernimento moral, literário e formativo do Veritas Libris.
        </span>
      </label>

      {errorMessage && <p className="text-xs font-semibold text-error">{errorMessage}</p>}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleClear}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary text-xs font-semibold cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpar Formulário
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !accepted}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Enviando...' : 'Enviar Sugestão'}
        </button>
      </div>
    </form>
  );
};
