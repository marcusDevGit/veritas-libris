import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, ShieldCheck, BookOpen } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'welcome-curatorship',
    title: 'Bem-vindo ao Veritas Libris',
    description:
      'Consulte pareceres morais ou importe uma obra pelo botão superior para iniciar um novo discernimento.',
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

export const NotificationsPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
            title={`${unreadCount} notificação não lida`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline/20 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-low border-b border-outline/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold text-primary">Central de Avisos</span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-secondary hover:text-primary flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar como lidas</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-outline/10 max-h-80 overflow-y-auto">
            {notifications.map((item) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
