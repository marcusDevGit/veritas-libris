import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Share2, Printer, Check } from 'lucide-react';

export interface BookDetailBreadcrumbProps {
  title: string;
  isbn13: string;
  publishedYear?: number;
}

/**
 * BookDetailBreadcrumb — Cabeçalho de Navegação e Referência Canônica
 *
 * Reproduz a barra superior da página de detalhes do Stitch:
 * - Breadcrumb: Início > Catálogo > Obra
 * - Pill com identificador canônico da obra
 * - Ações rápidas de compartilhamento e impressão do parecer
 */
export const BookDetailBreadcrumb: React.FC<BookDetailBreadcrumbProps> = ({
  title,
  isbn13,
  publishedYear,
}) => {
  const [copied, setCopied] = useState(false);

  const canonicalCode = `#VL-${publishedYear || 'ED'}-${isbn13.slice(-4)}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
        <Link to="/" className="hover:text-primary transition-colors">
          Início
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <Link to="/" className="hover:text-primary transition-colors">
          Catálogo
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-primary font-bold line-clamp-1 max-w-[260px] sm:max-w-md">
          {title}
        </span>
      </nav>

      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-secondary text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
          <span>ID Canônico: {canonicalCode}</span>
        </span>

        <button
          type="button"
          onClick={handleShare}
          title="Copiar link desta análise"
          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors relative"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          title="Imprimir / Exportar Parecer em PDF"
          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
