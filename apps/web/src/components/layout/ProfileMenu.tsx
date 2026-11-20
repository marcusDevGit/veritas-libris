import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Feather, LogOut, MessageSquareText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

export const ProfileMenu: React.FC = () => {
  const { user, profile, role, isCurator, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!user) return null;

  const userInitials = user.displayName
    ? user.displayName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'VL';

  const roleLabel =
    role === 'ADMIN'
      ? profile?.isFounder
        ? 'Superadmin'
        : 'Administrador'
      : role === 'CURATOR'
        ? 'Curador'
        : 'Leitor';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Abrir menu do perfil"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-container transition-colors cursor-pointer"
      >
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
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5" title="Conectado">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-surface" />
          </span>
        </div>

        <div className="hidden 2xl:flex flex-col text-left pr-1">
          <span className="text-xs font-semibold text-on-surface leading-none max-w-[100px] truncate">
            {user.displayName || 'Leitor'}
          </span>
          <span className="text-[10px] text-secondary font-bold uppercase mt-1 leading-none">
            {roleLabel}
          </span>
        </div>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline/20 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline/10">
            <p className="text-xs font-bold text-primary truncate">
              {user.displayName || 'Leitor'}
            </p>
            {user.email && (
              <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                {user.email}
              </p>
            )}
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-secondary-container/60 text-on-secondary-container text-[10px] font-bold uppercase">
              {roleLabel}
            </span>
          </div>

          <div className="py-1.5 flex flex-col text-xs font-semibold text-on-surface">
            <Link
              to="/minha-lista"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 hover:bg-surface-container-low flex items-center gap-2.5 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-secondary" />
              <span>Minha Lista de Leitura</span>
            </Link>

            <Link
              to="/meus-pareceres"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 hover:bg-surface-container-low flex items-center gap-2.5 transition-colors"
            >
              <MessageSquareText className="w-4 h-4 text-secondary" />
              <span>Meus Pareceres</span>
            </Link>

            {isCurator && (
              <Link
                to="/curadoria"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 hover:bg-surface-container-low flex items-center gap-2.5 transition-colors"
              >
                <Feather className="w-4 h-4 text-secondary" />
                <span>Painel de Curadoria</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 hover:bg-surface-container-low flex items-center gap-2.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Administração</span>
              </Link>
            )}
          </div>

          <div className="border-t border-outline/10 p-1.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                void signOut();
              }}
              className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-error hover:bg-error-container/25 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
