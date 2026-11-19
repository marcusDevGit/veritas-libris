import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import type { UserDto, UserRole } from '@app/shared';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase.js';
import { api, setAuthTokenProvider } from '../services/api.js';

interface AuthContextValue {
  user: User | null;
  profile: UserDto | null;
  role: UserRole;
  isCurator: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isFirebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

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
      if (currentUser) {
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
        signInWithGoogle,
        signOut,
        refreshProfile: loadProfile,
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
