import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookMarked, Search, ScanBarcode, Plus, LogIn } from 'lucide-react';
import { TopBanner } from './TopBanner.js';
import { NotificationsPopover } from './NotificationsPopover.js';
import { ProfileMenu } from './ProfileMenu.js';
import { useAuth } from '../../contexts/AuthContext.js';

export interface NavbarProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onOpenImportModal?: () => void;
  onOpenScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm = '',
  onSearchChange,
  onOpenImportModal,
  onOpenScanner,
}) => {
  const location = useLocation();
  const { user, isCurator, isAdmin, isLoading, signInWithGoogle } = useAuth();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const desktopSearchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        desktopSearchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const isSearchExpanded = isSearchFocused || searchTerm.trim().length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <TopBanner />

      <div className="h-16 sm:h-20 max-w-[1380px] mx-auto px-3 sm:px-5 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center shrink-0 min-w-0">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="p-1.5 sm:p-2 bg-primary text-on-primary rounded-xl group-hover:bg-primary-container transition-colors shadow-xs shrink-0">
              <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-container" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-editorial text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-primary leading-none group-hover:text-primary-container transition-colors truncate">
                Veritas Libris
              </span>
              <span className="text-[9px] sm:text-[11px] tracking-widest text-secondary font-bold uppercase mt-0.5 truncate">
                Índice de Leitura
              </span>
            </div>
          </Link>
        </div>

        <div
          className={`hidden sm:block flex-1 min-w-[180px] transition-all duration-200 ${
            isSearchExpanded ? 'max-w-2xl' : 'max-w-md lg:max-w-lg'
          }`}
        >
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
            <input
              ref={desktopSearchRef}
              type="text"
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar título, autor, tema ou ISBN..."
              className="w-full h-[42px] pl-10 pr-20 rounded-lg bg-surface-container-lowest border border-outline/25 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all shadow-2xs"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenScanner}
                title="Ler código de barras / ISBN"
                className="p-1 text-on-surface-variant hover:text-primary transition-colors flex items-center rounded cursor-pointer"
              >
                <ScanBarcode className="w-4 h-4" />
              </button>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant bg-surface-container border border-outline/20 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isSearchExpanded && (
            <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap mr-1">
              <Link
                to="/"
                className={`transition-colors py-1 ${
                  location.pathname === '/'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'hover:text-primary'
                }`}
              >
                Catálogo
              </Link>
              {user && (
                <Link
                  to="/minha-lista"
                  className={`transition-colors py-1 ${
                    location.pathname === '/minha-lista'
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'hover:text-primary'
                  }`}
                >
                  Minha Lista
                </Link>
              )}
              <Link
                to="/criterios"
                className={`transition-colors py-1 ${
                  location.pathname === '/criterios'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'hover:text-primary'
                }`}
              >
                Critérios
              </Link>
              <Link
                to="/sobre"
                className={`transition-colors py-1 ${
                  location.pathname === '/sobre'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'hover:text-primary'
                }`}
              >
                Sobre
              </Link>
              {isCurator && (
                <Link
                  to="/curadoria"
                  className={`transition-colors py-1 ${
                    location.pathname === '/curadoria'
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Curadoria
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`transition-colors py-1 ${
                    location.pathname === '/admin'
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3 xl:border-l xl:border-outline/20 xl:pl-4">
            <button
              type="button"
              aria-label="Abrir busca"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className="sm:hidden p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-all"
            >
              <Search className="w-4 h-4" />
            </button>

            <NotificationsPopover />

            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Avaliar / Importar</span>
                <span className="md:hidden">Importar</span>
              </button>
            )}

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-surface-container-high animate-pulse shrink-0" />
            ) : user ? (
              <ProfileMenu />
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors border border-outline/20 whitespace-nowrap cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-secondary" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 bg-surface border-t border-outline/10">
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar título, autor ou ISBN..."
              className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-container-lowest border border-outline/25 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/20"
            />
            <button
              type="button"
              onClick={onOpenScanner}
              title="Ler código de barras / ISBN"
              className="absolute right-2 p-1.5 text-on-surface-variant hover:text-primary"
            >
              <ScanBarcode className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
