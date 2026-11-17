import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase.js';
import { setAuthTokenProvider } from '../services/api.js';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isFirebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

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
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      setAuthTokenProvider(null);
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    if (!auth) {
      setAuthError(
        'As credenciais VITE_FIREBASE_* do frontend ainda não foram configuradas no apps/web/.env.'
      );
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(err?.message || 'Não foi possível concluir o login com Google.');
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirebaseConfigured,
        authError,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
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
