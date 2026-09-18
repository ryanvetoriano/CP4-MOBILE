import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { buildSession, clearSession, getSession, saveSession, type Session } from '../services/sessionStorage';
import type { LoginForm, RegisterForm } from '../utils/validation';

type AuthContextValue = {
  user: Session | null;
  initializing: boolean;
  register: (form: RegisterForm) => Promise<void>;
  login: (form: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  const syncSession = useCallback(async (firebaseUser: User) => {
    const session = buildSession(firebaseUser);
    await saveSession(session);
    setUser(session);
  }, []);

  useEffect(() => {
    let active = true;
    let firebaseResolved = false;

    // 1) Verifica se existe sessão salva no AsyncStorage para abrir direto a área autenticada.
    getSession().then((saved) => {
      if (!active || !saved || firebaseResolved) return;
      setUser(saved);
      setInitializing(false);
    });

    // 2) Confirma a sessão com o Firebase. Se o token não for mais válido
    //    (conta excluída, senha alterada etc.), a sessão local é removida.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      firebaseResolved = true;
      if (firebaseUser) {
        await syncSession(firebaseUser);
      } else {
        await clearSession();
        setUser(null);
      }
      if (active) setInitializing(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [syncSession]);

  const register = useCallback(
    async ({ name, email, password }: RegisterForm) => {
      const { user: created } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(created, { displayName: name.trim() });
      await syncSession(created);
    },
    [syncSession],
  );

  const login = useCallback(
    async ({ email, password }: LoginForm) => {
      const { user: logged } = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncSession(logged);
    },
    [syncSession],
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } finally {
      await clearSession();
      setUser(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  // Se o Firebase exigir login recente, a tela pede a senha e chama novamente com ela.
  const deleteAccount = useCallback(async (password?: string) => {
    const current = auth.currentUser;
    if (!current || !current.email) {
      throw Object.assign(new Error('Usuário não autenticado'), { code: 'auth/requires-recent-login' });
    }

    if (password) {
      const credential = EmailAuthProvider.credential(current.email, password);
      await reauthenticateWithCredential(current, credential);
    }

    await deleteUser(current);
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, register, login, logout, resetPassword, deleteAccount }),
    [user, initializing, register, login, logout, resetPassword, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
