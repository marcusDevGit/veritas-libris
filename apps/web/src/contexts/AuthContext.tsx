import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import type { UserDto, UserRole } from '@app/shared';
import { AuthModal } from '../components/domain/auth/AuthModal.js';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase.js';
import { api, setAuthTokenProvider } from '../services/api.js';
import { getFirebaseAuthErrorMessage } from '../utils/auth-errors.js';

interface AuthContextValue {
  user: User | null;
  profile: UserDto | null;
  role: UserRole;
  isCurator: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<'verified' | 'unverified' | 'error'>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  reloadUserSession: () => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isFirebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadProfile = async () => {
    try {
      const me = await api.getCurrentUser();
      setProfile(me);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const activeAuth = auth;

    setAuthTokenProvider(async () => {
      if (!activeAuth.currentUser) return null;
      return activeAuth.currentUser.getIdToken();
    });

    const unsubscribe = onAuthStateChanged(activeAuth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.emailVerified) {
        void loadProfile().finally(() => setIsLoading(false));
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      setAuthTokenProvider(null);
    };
  }, []);

  const openAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(false);
  };

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    if (!auth) {
      setAuthError(
        'As credenciais VITE_FIREBASE_* do frontend ainda não foram configuradas no apps/web/.env.'
      );
      return false;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err) {
      setAuthError(getFirebaseAuthErrorMessage(err, 'Não foi possível concluir o login com Google.'));
      return false;
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<'verified' | 'unverified' | 'error'> => {
    setAuthError(null);
    if (!auth) {
      setAuthError('As credenciais VITE_FIREBASE_* ainda não foram configuradas.');
      return 'error';
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        return 'unverified';
      }
      await loadProfile();
      return 'verified';
    } catch (err) {
      setAuthError(getFirebaseAuthErrorMessage(err, 'Não foi possível entrar com e-mail e senha.'));
      return 'error';
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    if (!auth) {
      setAuthError('As credenciais VITE_FIREBASE_* ainda não foram configuradas.');
      return false;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      return true;
    } catch (err) {
      setAuthError(getFirebaseAuthErrorMessage(err, 'Não foi possível concluir o cadastro.'));
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setAuthError(null);
    if (!auth) {
      setAuthError('As credenciais VITE_FIREBASE_* ainda não foram configuradas.');
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      setAuthError(getFirebaseAuthErrorMessage(err, 'Não foi possível enviar o e-mail de recuperação.'));
      return false;
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    setAuthError(null);
    if (!auth?.currentUser) return false;
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (err) {
      setAuthError(getFirebaseAuthErrorMessage(err, 'Não foi possível reenviar o e-mail de verificação.'));
      return false;
    }
  };

  const reloadUserSession = async (): Promise<boolean> => {
    setAuthError(null);
    if (!auth?.currentUser) return false;
    try {
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        await auth.currentUser.getIdToken(true);
        setUser({ ...auth.currentUser });
        await loadProfile();
        return true;
      }
      return false;
    } catch (err) {
      setAuthError(getFirebaseAuthErrorMessage(err, 'Não foi possível atualizar o status da conta.'));
      return false;
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const role: UserRole = profile?.role ?? 'READER';
  const isAdmin = role === 'ADMIN';
  const isCurator = role === 'CURATOR' || role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isCurator,
        isAdmin,
        isLoading,
        isFirebaseConfigured,
        authError,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        clearAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        resendVerificationEmail,
        reloadUserSession,
        signOut,
        refreshProfile: loadProfile,
      }}
    >
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return ctx;
}
