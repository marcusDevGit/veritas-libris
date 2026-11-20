import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu.js';

const mockUseAuth = vi.fn();

vi.mock('../../contexts/AuthContext.js', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ProfileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('oculta atalhos de curadoria e admin para leitor comum e executa logout', () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: { displayName: 'João Leitor', email: 'joao@example.com', photoURL: null },
      profile: { isFounder: false },
      role: 'READER',
      isCurator: false,
      isAdmin: false,
      signOut,
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu do perfil' }));

    expect(screen.getByText('Minha Lista de Leitura')).toBeInTheDocument();
    expect(screen.queryByText('Painel de Curadoria')).not.toBeInTheDocument();
    expect(screen.queryByText('Administração')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Sair da conta/i }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('exibe atalhos de Curadoria e Administração e rótulo Superadmin para admin fundador', () => {
    mockUseAuth.mockReturnValue({
      user: { displayName: 'Marcus Admin', email: 'admin@example.com', photoURL: null },
      profile: { isFounder: true },
      role: 'ADMIN',
      isCurator: true,
      isAdmin: true,
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProfileMenu />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu do perfil' }));

    expect(screen.getAllByText('Superadmin').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Painel de Curadoria')).toBeInTheDocument();
    expect(screen.getByText('Administração')).toBeInTheDocument();
  });
});
