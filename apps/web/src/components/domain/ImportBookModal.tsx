import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import type { ExternalBookResult } from '@app/shared';
import { Button } from '../ui/Button.js';
import { X, Search, BookOpen, Check, Download } from 'lucide-react';

export interface ImportBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const ImportBookModal: React.FC<ImportBookModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<ExternalBookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const runSearch = useCallback(async (query: string) => {
    const cleaned = query.trim();
    if (!cleaned) return;

    setIsSearching(true);
    setErrorMsg(null);
    try {
      const data = await api.searchExternal(cleaned, 8);
      setResults(data.items);
      if (data.items.length === 0) {
        setErrorMsg('Nenhuma obra com ISBN válido foi localizada na Google Books.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao consultar a Google Books API.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setSearchTerm(initialQuery);
      runSearch(initialQuery);
    }
  }, [isOpen, initialQuery, runSearch]);

  const importMutation = useMutation({
    mutationFn: (isbn13: string) => api.importBook(isbn13),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['curation-books'] });
      onClose();
      navigate(`/livros/${data.book._id}`);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Falha ao importar o livro');
    },
  });

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(searchTerm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface border border-outline/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-outline/15 flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-lg font-bold text-primary">Importar Obra Externa</h2>
            <p className="text-xs text-on-surface-variant">
              Busque pelo título, autor ou digite/escaneie o ISBN-13
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="p-5 border-b border-outline/10 bg-surface-container-low flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Dom Casmurro ou 9788533613379"
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline/25 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          <Button type="submit" variant="primary" size="md" isLoading={isSearching}>
            Buscar
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {errorMsg && (
            <div className="p-3 bg-error-container/30 border border-error/20 rounded-lg text-xs text-error">
              {errorMsg}
            </div>
          )}

          {results.map((item) => (
            <div
              key={item.isbn13}
              className="flex items-center justify-between gap-4 p-3 bg-surface border border-outline/15 rounded-xl hover:border-outline/30 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-16 bg-surface-container rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-outline" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-editorial text-sm font-bold text-on-surface truncate">{item.title}</h4>
                  <p className="text-xs text-on-surface-variant truncate">{item.authors.join(', ')}</p>
                  <p className="text-[11px] text-outline font-mono mt-0.5">ISBN: {item.isbn13}</p>
                </div>
              </div>

              <div>
                {item.alreadyImported ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      navigate(`/livros/${item.localBookId}`);
                    }}
                  >
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span>Ver Obra</span>
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={importMutation.isPending && importMutation.variables === item.isbn13}
                    onClick={() => importMutation.mutate(item.isbn13)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Importar</span>
                  </Button>
                )}
              </div>
            </div>
          ))}

          {!isSearching && results.length === 0 && !errorMsg && (
            <div className="text-center py-12 text-outline text-xs">
              Digite um termo ou ISBN acima para pesquisar no acervo mundial.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
