import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookMarked, Bookmark, Search, ScanBarcode, Plus, LogIn, LogOut, ShieldCheck, Feather } from 'lucide-react';
import { TopBanner } from './TopBanner.js';
import { NotificationsPopover } from './NotificationsPopover.js';
import { useAuth } from '../../contexts/AuthContext.js';

export interface NavbarProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onOpenImportModal?: () => void;
  onOpenScanner?: () => void;
}

/**
 * Navbar — Barra de Navegação Superior Integrada
 *
 * Reproduz com máxima fidelidade o layout do Stitch:
 * - TopBanner litúrgico
 * - Identidade visual "Veritas Libris • Índice de Leitura"
 * - Campo de busca integrado com atalho ⌘K e acionador de scanner de código de barras
 * - Links editoriais e botão de ação rápida "Avaliar / Importar Livro"
 * - Indicador de perfil curatorial
 */
export const Navbar: React.FC<NavbarProps> = ({
  searchTerm = '',
  onSearchChange,
  onOpenImportModal,
  onOpenScanner,
}) => {
  const location = useLocation();
  const { user, profile, role, isCurator, isAdmin, isLoading, signInWithGoogle, signOut } = useAuth();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const roleLabel =
    role === 'ADMIN'
      ? profile?.isFounder
        ? 'Superadmin'
        : 'Administrador'
      : role === 'CURATOR'
        ? 'Curador'
        : 'Autenticado';

  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'VL';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <TopBanner />

      <div className="h-16 sm:h-20 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="p-1.5 sm:p-2 bg-primary text-on-primary rounded-xl group-hover:bg-primary-container transition-colors shadow-xs shrink-0">
              <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-container" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-editorial text-base sm:text-2xl font-bold tracking-tight text-primary leading-none group-hover:text-primary-container transition-colors truncate">
                Veritas Libris
              </span>
              <span className="text-[9px] sm:text-xs tracking-widest text-secondary font-bold uppercase mt-0.5 sm:mt-1 truncate">
                Índice de Leitura
              </span>
            </div>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar título, autor, tema ou ISBN..."
              className="w-full h-[42px] pl-10 pr-20 rounded-lg bg-surface-container-lowest border border-outline/25 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all shadow-2xs"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenScanner}
                title="Ler código de barras / ISBN"
                className="p-1 text-on-surface-variant hover:text-primary transition-colors flex items-center rounded"
              >
                <ScanBarcode className="w-4 h-4" />
              </button>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant bg-surface-container border border-outline/20 rounded shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-on-surface-variant">
            <Link
              to="/"
              className={`transition-colors py-1 ${
                location.pathname === '/' ? 'text-primary font-bold border-b-2 border-primary' : 'hover:text-primary'
              }`}
            >
              Catálogo
            </Link>
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
            <a
              href="#criterios"
              className="hover:text-primary transition-colors py-1"
            >
              Critérios do Índice
            </a>
            <a
              href="#sobre"
              className="hover:text-primary transition-colors py-1"
            >
              Sobre a Curadoria
            </a>
            {isCurator && (
              <Link
                to="/curadoria"
                className={`inline-flex items-center gap-1 transition-colors py-1 ${
                  location.pathname === '/curadoria'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                Curadoria
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1 transition-colors py-1 ${
                  location.pathname === '/admin'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Administração
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 sm:border-l sm:border-outline/20 sm:pl-6">
            <button
              type="button"
              aria-label="Abrir busca"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className="sm:hidden p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-all"
            >
              <Search className="w-4 h-4" />
            </button>

            <NotificationsPopover />

            {user && (
              <Link
                to="/minha-lista"
                title="Minha Lista de Leitura"
                className="xl:hidden p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-all"
              >
                <Bookmark className="w-4 h-4" />
              </Link>
            )}

            {isCurator && (
              <Link
                to="/curadoria"
                title="Painel de Curadoria Oficial"
                className="xl:hidden p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-all"
              >
                <Feather className="w-4 h-4" />
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                title="Área do Administrador"
                className="xl:hidden p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            )}

            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Avaliar / Importar Obra</span>
                <span className="sm:hidden">Importar</span>
              </button>
            )}

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-surface-container-high animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2.5 pl-1">
                <div className="relative">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuário'}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-outline/30"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-primary ring-1 ring-outline/30">
                      {userInitials}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5"
                    title="Conectado"
                  >
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-surface" />
                  </span>
                </div>
                <div className="hidden 2xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-on-surface leading-none max-w-[110px] truncate">
                    {user.displayName || 'Leitor'}
                  </span>
                  <span className="text-[10px] text-secondary font-bold uppercase mt-1 leading-none">
                    {roleLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  title="Sair da conta"
                  className="p-1.5 text-outline hover:text-error hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors border border-outline/20 cursor-pointer"
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
