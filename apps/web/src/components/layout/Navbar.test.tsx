import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './Navbar.js';

vi.mock('../../contexts/AuthContext.js', () => ({
  useAuth: () => ({
    user: null,
    isCurator: false,
    isAdmin: false,
    isLoading: false,
    signInWithGoogle: vi.fn(),
  }),
}));

describe('Navbar', () => {
  it('abre e fecha o menu de navegação móvel com links públicos', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const toggleBtn = screen.getByRole('button', { name: /Abrir menu/i });
    expect(screen.queryByRole('navigation', { name: /Menu de navegação móvel/i })).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    const mobileNav = screen.getByRole('navigation', { name: /Menu de navegação móvel/i });
    expect(mobileNav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Guia' })).toHaveAttribute('href', '/guia');
    expect(screen.getByRole('link', { name: 'Sugestões' })).toHaveAttribute('href', '/sugestoes');
  });
});
