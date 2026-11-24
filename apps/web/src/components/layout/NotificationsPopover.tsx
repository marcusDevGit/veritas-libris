import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, ShieldCheck, BookOpen, Archive, X, ThumbsUp, Feather } from 'lucide-react';
import type { NotificationDto } from '@app/shared';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

interface GuestNotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL_GUEST_NOTIFICATIONS: GuestNotificationItem[] = [
  {
    id: 'welcome-curatorship',
    title: 'Bem-vindo ao Veritas Libris',
    description:
      'Consulte pareceres morais ou salve obras em Minha Lista para receber avisos quando houver novidades.',
    time: 'Agora',
    read: false,
  },
  {
    id: 'doctrine-criteria',
    title: 'Critérios em 4 Dimensões',
    description:
      'Avalie sempre considerando Fidelidade Doutrinária, Modéstia, Gravidade da Violência e Mérito Literário.',
    time: 'Guia Pastoral',
    read: true,
  },
];

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(isoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export const NotificationsPopover: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [guestNotifications, setGuestNotifications] = useState<GuestNotificationItem[]>(
    INITIAL_GUEST_NOTIFICATIONS,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  const notificationsQueryKey = ['notifications', user?.uid ?? 'guest'] as const;

  const { data, isLoading } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: api.listNotifications,
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });

  const markAllMutation = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });

  const archiveReadMutation = useMutation({
    mutationFn: api.archiveReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });

  const archiveOneMutation = useMutation({
    mutationFn: api.archiveNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });

  const unreadCount = user
    ? (data?.unreadCount ?? 0)
    : guestNotifications.filter((n) => !n.read).length;
  const hasReadUserNotifications = Boolean(user && data?.items.some((n) => n.read));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllMutation.mutate();
      return;
    }
    setGuestNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = (item: NotificationDto) => {
    if (!item.read) {
      markOneMutation.mutate(item.id);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notificações"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-all cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface"
            title={`${unreadCount} notificação(ões) não lida(s)`}
          />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-24 sm:inset-auto sm:absolute sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-surface-container-lowest border border-outline/20 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold text-primary">Central de Avisos</span>
            </div>
            <div className="flex items-center gap-2.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllMutation.isPending}
                  className="text-[11px] font-semibold text-secondary hover:text-primary flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Marcar como lidas</span>
                </button>
              )}
              {hasReadUserNotifications && (
                <button
                  type="button"
                  onClick={() => archiveReadMutation.mutate()}
                  disabled={archiveReadMutation.isPending}
                  className="text-[11px] font-semibold text-outline hover:text-primary flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Limpar lidas</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-outline/10 max-h-80 overflow-y-auto">
            {user ? (
              isLoading ? (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  Carregando notificações...
                </div>
              ) : (data?.items.length ?? 0) === 0 ? (
                <div className="p-6 text-center text-xs text-on-surface-variant leading-relaxed">
                  Nenhum aviso para os livros da sua lista ainda. Salve obras em{' '}
                  <Link
                    to="/minha-lista"
                    onClick={() => setIsOpen(false)}
                    className="font-semibold text-primary hover:underline"
                  >
                    Minha Lista
                  </Link>{' '}
                  para acompanhar novos pareceres e atualizações editoriais.
                </div>
              ) : (
                data!.items.map((item) => {
                  const Icon =
                    item.type === 'EDITORIAL_UPDATE'
                      ? ShieldCheck
                      : item.type === 'REVIEW_HELPFUL'
                        ? ThumbsUp
                        : item.type === 'ROLE_UPDATED'
                          ? Feather
                          : BookOpen;
                  const targetPath =
                    item.link || (item.bookId ? `/livros/${item.bookId}` : '/');

                  return (
                    <div
                      key={item.id}
                      className={`p-4 flex items-start gap-3 transition-colors hover:bg-surface-container-low ${
                        item.read ? 'bg-surface-container-lowest' : 'bg-secondary-container/15'
                      }`}
                    >
                      <Link
                        to={targetPath}
                        onClick={() => handleItemClick(item)}
                        className="flex items-start gap-3 flex-1 min-w-0"
                      >
                        <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-primary truncate">{item.title}</p>
                            <span className="text-[10px] text-outline shrink-0">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                          {item.bookTitle && (
                            <p className="text-[11px] font-semibold text-secondary truncate mt-0.5">
                              {item.bookTitle}
                            </p>
                          )}
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        aria-label={`Arquivar notificação ${item.title}`}
                        onClick={() => archiveOneMutation.mutate(item.id)}
                        disabled={archiveOneMutation.isPending}
                        className="p-1 text-outline hover:text-primary rounded transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )
            ) : (
              guestNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-start gap-3 transition-colors ${
                    item.read ? 'bg-surface-container-lowest' : 'bg-secondary-container/15'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-surface-container text-primary shrink-0 mt-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-primary truncate">{item.title}</p>
                      <span className="text-[10px] text-outline shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
