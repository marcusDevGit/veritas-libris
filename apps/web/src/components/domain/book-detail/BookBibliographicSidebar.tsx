import React, { useState } from 'react';
import type { BookDto } from '@app/shared';
import { ImprimaturSeal } from '../ImprimaturSeal.js';
import {
  BookOpen,
  MessageSquarePlus,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Lock,
  ShoppingBag,
  Store,
  ExternalLink,
} from 'lucide-react';

const LANGUAGE_LABELS: Record<string, string> = {
  pt: 'Português',
  'pt-br': 'Português (Brasil)',
  en: 'Inglês',
  es: 'Espanhol',
  la: 'Latim',
  fr: 'Francês',
  it: 'Italiano',
  de: 'Alemão',
  ru: 'Russo',
  el: 'Grego',
};

function formatLanguage(code?: string): string {
  if (!code) return 'Não informado';
  const normalized = code.trim().toLowerCase();
  return LANGUAGE_LABELS[normalized] || code.toUpperCase();
}

export interface BookBibliographicSidebarProps {
  book: BookDto;
  onOpenReviewModal?: () => void;
}

/**
 * BookBibliographicSidebar — Coluna Esquerda Sticky da Ficha do Livro
 *
 * Reproduz a coluna lateral do Stitch:
 * - Capa em destaque com efeito de lombada editorial
 * - Botões de ação primária ("+ Avaliar este Livro" e "Salvar na Lista")
 * - Especificações bibliográficas (ISBN-13, Publicação, Classificação)
 * - Selo de Curadoria Oficial / Imprimatur / Trava Editorial
 * - Card de parceiros / onde adquirir edições fidedignas
 */
export const BookBibliographicSidebar: React.FC<BookBibliographicSidebarProps> = ({
  book,
  onOpenReviewModal,
}) => {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <aside className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-6">
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline/10 flex flex-col items-center">
        <div className="relative w-56 aspect-[3/4] mb-6 rounded-lg overflow-hidden shadow-md group bg-surface-container flex items-center justify-center">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Capa de ${book.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-outline text-center">
              <BookOpen className="w-16 h-16 mb-2 stroke-[1.2]" />
              <span className="text-xs font-editorial font-bold line-clamp-3">{book.title}</span>
            </div>
          )}

          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/35 via-black/10 to-transparent pointer-events-none" />

          <span className="absolute top-3 right-3 bg-primary text-on-primary text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow">
            {book.hasImprimatur ? 'IMPRIMATUR' : 'ACERVO VERITAS'}
          </span>
        </div>

        <div className="w-full text-center pb-4 mb-4 border-b border-outline/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            {book.tags.length > 0 ? book.tags.slice(0, 2).join(' • ') : 'Obra Catalogada'}
          </span>
          {book.subtitle && (
            <p className="text-xs font-medium text-on-surface-variant mt-1 line-clamp-2">
              {book.subtitle}
            </p>
          )}
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="w-full h-11 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>+ Avaliar este Livro</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaved((prev) => !prev)}
            className={`w-full h-10 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isSaved
                ? 'bg-secondary-container/40 text-secondary border border-secondary/30'
                : 'bg-surface-container hover:bg-surface-container-high text-primary'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-secondary" />
                <span>Salvo na Lista de Leitura</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Salvar na Lista de Leitura</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full mt-6 bg-surface-container-low rounded-lg p-4 flex flex-col gap-2.5 text-xs text-on-surface-variant border border-outline/10">
          <div className="flex justify-between items-center gap-2">
            <span className="text-outline font-medium">ISBN-13</span>
            <span className="font-semibold text-on-surface font-mono">{book.isbn13}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-outline font-medium">Editora</span>
            <span className="font-semibold text-on-surface text-right line-clamp-1">
              {book.publisher || 'Não informada'}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-outline font-medium">Volume / Páginas</span>
            <span className="font-semibold text-on-surface">
              {book.pageCount ? `${book.pageCount} páginas` : 'Não informado'}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-outline font-medium">Data de Publicação</span>
            <span className="font-semibold text-on-surface">
              {book.publishedYear || 'Não informada'}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-outline font-medium">Idioma Original</span>
            <span className="font-semibold text-on-surface">
              {formatLanguage(book.language)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2 pt-1.5 border-t border-outline/10">
            <span className="text-outline font-medium">Classificação</span>
            <span className="font-semibold text-on-surface">{book.recommendedAge}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-outline font-medium">Pareceres</span>
            <span className="font-semibold text-on-surface">
              {book.communityStats.totalReviews} avaliações
            </span>
          </div>
        </div>

        {book.hasImprimatur && (
          <div className="w-full mt-4">
            <ImprimaturSeal expanded />
          </div>
        )}

        {book.editorialLock && (
          <div className="w-full mt-3 p-3.5 bg-primary-container/15 border border-primary/20 rounded-lg flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-primary">Veredito Editorial Fixado</p>
              <p className="text-on-surface-variant mt-0.5 leading-snug">
                Classificação protegida por consenso curatorial oficial.
              </p>
            </div>
          </div>
        )}

        <div className="w-full mt-4 p-3.5 bg-surface-container-high rounded-lg flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="text-primary font-bold">Curadoria Veritas Libris</p>
            <p className="text-on-surface-variant mt-0.5 leading-snug">
              Análise moral e literária baseada na Tradição e no Magistério Eclesial.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-secondary" />
            <span>Onde Encontrar</span>
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-surface-container text-secondary rounded">
            Acervo Seguro
          </span>
        </div>

        <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
          Pesquise edições fidedignas desta obra pelo ISBN-13 em livrarias católicas e catálogos oficiais:
        </p>

        <div className="flex flex-col gap-2">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`"${book.title}" ISBN ${book.isbn13} livro`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface hover:bg-surface-container transition-colors group border border-outline/10"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-on-surface group-hover:text-primary">
                Buscar Edição por ISBN
              </span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-secondary" />
          </a>
        </div>
      </div>
    </aside>
  );
};
