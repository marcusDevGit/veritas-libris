import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsPopover } from './NotificationsPopover.js';

const mockUseAuth = vi.fn();
const mockListNotifications = vi.fn();
const mockMarkAllNotificationsRead = vi.fn();
const mockMarkNotificationRead = vi.fn();
const mockArchiveReadNotifications = vi.fn();
const mockArchiveNotification = vi.fn();

vi.mock('../../contexts/AuthContext.js', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../services/api.js', () => ({
  api: {
    listNotifications: () => mockListNotifications(),
    markAllNotificationsRead: () => mockMarkAllNotificationsRead(),
    markNotificationRead: (id: string) => mockMarkNotificationRead(id),
    archiveReadNotifications: () => mockArchiveReadNotifications(),
    archiveNotification: (id: string) => mockArchiveNotification(id),
  },
}));

function renderPopover() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotificationsPopover />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NotificationsPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe avisos locais para visitante e permite marcar como lidos', () => {
    mockUseAuth.mockReturnValue({ user: null });

    renderPopover();

    const trigger = screen.getByRole('button', { name: 'Notificações' });
    fireEvent.click(trigger);

    expect(screen.getByText('Bem-vindo ao Veritas Libris')).toBeInTheDocument();
    const markAllBtn = screen.getByRole('button', { name: /Marcar como lidas/i });
    fireEvent.click(markAllBtn);

    expect(screen.queryByRole('button', { name: /Marcar como lidas/i })).not.toBeInTheDocument();
  });

  it('carrega notificações reais quando logado e marca item como lido ao clicar', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u-1' } });
    mockListNotifications.mockResolvedValue({
      unreadCount: 1,
      items: [
        {
          id: 'notif-1',
          bookId: 'book-42',
          bookTitle: 'O Senhor dos Anéis',
          type: 'NEW_REVIEW',
          title: 'Novo parecer publicado',
          description: 'Um leitor avaliou uma obra da sua lista.',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    mockMarkNotificationRead.mockResolvedValue({ read: true });

    renderPopover();

    fireEvent.click(screen.getByRole('button', { name: 'Notificações' }));

    const link = await screen.findByRole('link', { name: /Novo parecer publicado/i });
    expect(link).toHaveAttribute('href', '/livros/book-42');
    expect(screen.getByText('O Senhor dos Anéis')).toBeInTheDocument();

    fireEvent.click(link);
    await waitFor(() => {
      expect(mockMarkNotificationRead).toHaveBeenCalledWith('notif-1');
    });
  });

  it('permite limpar notificações lidas e arquivar item individual', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u-1' } });
    mockListNotifications.mockResolvedValue({
      unreadCount: 0,
      items: [
        {
          id: 'notif-read',
          bookId: 'book-9',
          bookTitle: 'Confissões',
          type: 'EDITORIAL_UPDATE',
          title: 'Parecer oficial atualizado',
          description: 'Trava editorial aplicada.',
          read: true,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    mockArchiveReadNotifications.mockResolvedValue({ archived: 1 });
    mockArchiveNotification.mockResolvedValue({ archived: 1 });

    renderPopover();
    fireEvent.click(screen.getByRole('button', { name: 'Notificações' }));

    const clearReadBtn = await screen.findByRole('button', { name: /Limpar lidas/i });
    fireEvent.click(clearReadBtn);
    await waitFor(() => {
      expect(mockArchiveReadNotifications).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /Arquivar notificação Parecer oficial atualizado/i }));
    await waitFor(() => {
      expect(mockArchiveNotification).toHaveBeenCalledWith('notif-read');
    });
  });
});
