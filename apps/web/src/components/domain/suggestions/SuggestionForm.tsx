import React, { useState } from 'react';
import type { CreateSuggestionBody, SuggestionType } from '@app/shared';
import { BookOpen, CheckCircle2, Lightbulb, Send } from 'lucide-react';
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

  if (isSuccess) {
    return (
      <div className="bg-surface-container-lowest border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
        <CheckCircle2 className="w-11 h-11 text-emerald-700 mx-auto" />
        <h2 className="font-editorial text-xl font-bold text-primary">
          Sugestão registrada com sucesso!
        </h2>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          Obrigado por contribuir com o Veritas Libris. Nossa equipe curatorial analisará sua indicação em breve.
        </p>
        <button
          type="button"
          onClick={() => {
            setTitle('');
            setAuthor('');
            setIsbn13('');
            setMessage('');
            onResetSuccess();
          }}
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
      className="bg-surface-container-lowest border border-outline/15 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5"
    >
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
            <p className="text-xs font-bold text-primary">Melhoria na Plataforma</p>
            <p className="text-[11px] text-on-surface-variant">Ideias ou correções</p>
          </div>
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-primary mb-1">
          {type === 'BOOK' ? 'Título da Obra *' : 'Assunto da Melhoria *'}
        </label>
        <input
          type="text"
          required
          minLength={2}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            type === 'BOOK' ? 'Ex: O Senhor do Mundo' : 'Ex: Filtro por editora católica'
          }
          className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
        />
      </div>

      {type === 'BOOK' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-primary mb-1">Autor</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex: Robert Hugh Benson"
              className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary mb-1">ISBN-13 (opcional)</label>
            <input
              type="text"
              value={isbn13}
              onChange={(e) => setIsbn13(e.target.value)}
              placeholder="978..."
              className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-primary mb-1">Seu Nome (opcional)</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Como podemos identificá-lo"
            className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-primary mb-1">Seu E-mail (opcional)</label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="nome@exemplo.com"
            className="w-full h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-primary mb-1">
          Justificativa / Detalhes *
        </label>
        <textarea
          required
          minLength={10}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Explique por que esta obra merece análise ou detalhe sua sugestão..."
          className="w-full p-3.5 rounded-lg bg-surface-container-low border border-outline/20 text-sm text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest"
        />
      </div>

      {errorMessage && <p className="text-xs font-semibold text-error">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? 'Enviando...' : 'Enviar Sugestão'}
      </button>
    </form>
  );
};
