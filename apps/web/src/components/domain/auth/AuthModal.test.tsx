import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFirebaseAuthErrorMessage } from '../../../utils/auth-errors.js';
import { AuthModal } from './AuthModal.js';

const mockUseAuth = vi.fn();

vi.mock('../../../contexts/AuthContext.js', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AuthModal & getFirebaseAuthErrorMessage', () => {
  const baseAuth = {
    user: null,
    isAuthModalOpen: true,
    closeAuthModal: vi.fn(),
    isFirebaseConfigured: true,
    authError: null,
    clearAuthError: vi.fn(),
    signInWithGoogle: vi.fn(async () => true),
    signInWithEmail: vi.fn(async () => 'verified' as const),
    signUpWithEmail: vi.fn(async () => true),
    sendPasswordReset: vi.fn(async () => true),
    resendVerificationEmail: vi.fn(async () => true),
    reloadUserSession: vi.fn(async () => true),
    signOut: vi.fn(async () => undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(baseAuth);
  });

  it('exige nome completo obrigatório no cadastro antes de chamar signUpWithEmail', async () => {
    render(<AuthModal />);

    fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'leitor@veritas.org' },
    });
    fireEvent.change(screen.getByLabelText(/Senha/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Criar conta e verificar e-mail/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Informe seu nome completo/i);
    expect(baseAuth.signUpWithEmail).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: 'Tomás de Aquino' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Criar conta e verificar e-mail/i }));

    await waitFor(() => {
      expect(baseAuth.signUpWithEmail).toHaveBeenCalledWith('Tomás de Aquino', 'leitor@veritas.org', '123456');
    });
  });

  it('envia link de recuperação de senha na aba Recuperar', async () => {
    render(<AuthModal />);

    fireEvent.click(screen.getByRole('button', { name: /^Recuperar$/i }));
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'esqueci@veritas.org' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar link de recuperação/i }));

    await waitFor(() => {
      expect(baseAuth.sendPasswordReset).toHaveBeenCalledWith('esqueci@veritas.org');
    });
    expect(await screen.findByText(/Enviamos um link de redefinição/i)).toBeInTheDocument();
  });

  it('traduz códigos de erro do Firebase Auth para mensagens amigáveis em PT-BR', () => {
    expect(getFirebaseAuthErrorMessage({ code: 'auth/invalid-credential' })).toMatch(/incorretos/i);
    expect(getFirebaseAuthErrorMessage({ code: 'auth/email-already-in-use' })).toMatch(/já está cadastrado/i);
    expect(getFirebaseAuthErrorMessage({ code: 'auth/weak-password' })).toMatch(/pelo menos 6 caracteres/i);
    expect(getFirebaseAuthErrorMessage({ code: 'auth/too-many-requests' })).toMatch(/Muitas tentativas/i);
    expect(getFirebaseAuthErrorMessage({ code: 'auth/account-exists-with-different-credential' })).toMatch(
      /outro método/i
    );
  });
});
