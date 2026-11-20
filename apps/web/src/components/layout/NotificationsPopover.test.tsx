import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsPopover } from './NotificationsPopover.js';

const mockUseAuth = vi.fn();
const mockListNotifications = vi.fn();
const mockMarkAllNotificationsRead = vi.fn();
const mockMarkNotificationRead = vi.fn();

vi.mock('../../contexts/AuthContext.js', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../services/api.js', () => ({
  api: {
    listNotifications: () => mockListNotifications(),
    markAllNotificationsRead: () => mockMarkAllNotificationsRead(),
    markNotificationRead: (id: string) => mockMarkNotificationRead(id),
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
});
