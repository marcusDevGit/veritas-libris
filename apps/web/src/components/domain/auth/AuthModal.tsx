import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Mail, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext.js';
import { Button } from '../../ui/Button.js';

type AuthTab = 'login' | 'register' | 'reset';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    isFirebaseConfigured,
    authError,
    clearAuthError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    resendVerificationEmail,
    reloadUserSession,
    signOut,
  } = useAuth();

  const [tab, setTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const displayedError = localError || authError;

  const switchTab = (nextTab: AuthTab) => {
    setTab(nextTab);
    setLocalError(null);
    setInfoMessage(null);
    clearAuthError();
  };

  const handleGoogle = async () => {
    setLocalError(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      const ok = await signInWithGoogle();
      if (ok) closeAuthModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setInfoMessage(null);
    clearAuthError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError('Informe seu endereço de e-mail.');
      return;
    }

    if (tab === 'reset') {
      setIsSubmitting(true);
      try {
        const ok = await sendPasswordReset(trimmedEmail);
        if (ok) {
          setInfoMessage('Enviamos um link de redefinição de senha para o seu e-mail.');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (tab === 'register') {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        setLocalError('Informe seu nome completo (mínimo de 2 caracteres).');
        return;
      }
      if (password.length < 6) {
        setLocalError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      setIsSubmitting(true);
      try {
        const ok = await signUpWithEmail(trimmedName, trimmedEmail, password);
        if (ok) {
          setInfoMessage(
            'Conta criada! Enviamos um link de confirmação para o seu e-mail. Confirme-o para liberar todas as ações.'
          );
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      setLocalError('Informe sua senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signInWithEmail(trimmedEmail, password);
      if (result === 'verified') {
        closeAuthModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReloadVerification = async () => {
    setLocalError(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      const verified = await reloadUserSession();
      if (verified) {
        closeAuthModal();
      } else {
        setLocalError('O e-mail ainda consta como não verificado. Clique no link enviado e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setLocalError(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      const ok = await resendVerificationEmail();
      if (ok) {
        setInfoMessage('Novo link de verificação enviado! Verifique sua caixa de entrada e spam.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPendingVerification = Boolean(user && !user.emailVerified);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xl p-6 text-on-surface">
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Fechar janela de autenticação"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 pr-8">
          <h2 id="auth-modal-title" className="font-serif text-xl font-bold text-primary">
            {isPendingVerification
              ? 'Confirme seu e-mail'
              : tab === 'login'
                ? 'Entrar no Veritas Libris'
                : tab === 'register'
                  ? 'Criar sua conta'
                  : 'Recuperar senha'}
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            {isPendingVerification
              ? 'Por segurança, exigimos a confirmação do e-mail antes de sincronizar seu perfil.'
              : 'Acesse sua lista de leitura, pareceres e curadoria.'}
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
            As credenciais <code>VITE_FIREBASE_*</code> ainda não foram configuradas no ambiente.
          </div>
        )}

        {displayedError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{displayedError}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {isPendingVerification && user ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
              Enviamos um link de confirmação para <strong className="text-on-surface">{user.email}</strong>.
              Após clicar no link, confirme abaixo para liberar o acesso.
            </div>
            <div className="flex flex-col gap-2.5">
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={handleReloadVerification}
              >
                Já confirmei meu e-mail
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleResendVerification}
              >
                Reenviar e-mail de verificação
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => void signOut()}
              >
                Sair e usar outra conta
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 border-outline-variant/60 bg-surface"
              disabled={!isFirebaseConfigured || isSubmitting}
              onClick={handleGoogle}
            >
              <span>Continuar com Google</span>
            </Button>

            <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-on-surface-variant">
              <div className="h-px flex-1 bg-outline-variant/40" />
              <span>ou com e-mail</span>
              <div className="h-px flex-1 bg-outline-variant/40" />
            </div>

            <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-surface-container-low p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={`rounded-md py-1.5 transition-colors ${
                  tab === 'login' ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-on-surface-variant'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => switchTab('register')}
                className={`rounded-md py-1.5 transition-colors ${
                  tab === 'register' ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-on-surface-variant'
                }`}
              >
                Criar Conta
              </button>
              <button
                type="button"
                onClick={() => switchTab('reset')}
                className={`rounded-md py-1.5 transition-colors ${
                  tab === 'reset' ? 'bg-surface text-primary shadow-xs font-semibold' : 'text-on-surface-variant'
                }`}
              >
                Recuperar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {tab === 'register' && (
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-medium text-on-surface-variant mb-1">
                    Nome completo
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex.: Tomás de Aquino"
                    autoComplete="name"
                    className="w-full rounded-lg border border-outline-variant/60 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-medium text-on-surface-variant mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-outline-variant/60 bg-surface pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {tab !== 'reset' && (
                <div>
                  <label htmlFor="auth-password" className="block text-xs font-medium text-on-surface-variant mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tab === 'register' ? 'Mínimo de 6 caracteres' : 'Sua senha'}
                      autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                      className="w-full rounded-lg border border-outline-variant/60 bg-surface pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center gap-2"
                disabled={!isFirebaseConfigured || isSubmitting}
              >
                {tab === 'register' && <UserPlus className="h-4 w-4" />}
                <span>
                  {isSubmitting
                    ? 'Aguarde...'
                    : tab === 'login'
                      ? 'Entrar com E-mail'
                      : tab === 'register'
                        ? 'Criar conta e verificar e-mail'
                        : 'Enviar link de recuperação'}
                </span>
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
