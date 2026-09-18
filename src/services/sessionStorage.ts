import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from 'firebase/auth';

const SESSION_KEY = '@cp4-mobile:session';

// Somente dados de identificação do usuário são salvos. A senha nunca é armazenada.
export type Session = {
  uid: string;
  name: string;
  email: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  savedAt: string;
};

export function buildSession(firebaseUser: User): Session {
  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName ?? '',
    email: firebaseUser.email,
    createdAt: firebaseUser.metadata.creationTime ?? null,
    lastLoginAt: firebaseUser.metadata.lastSignInTime ?? null,
    savedAt: new Date().toISOString(),
  };
}

export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<Session | null> {
  try {
    const value = await AsyncStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as Session) : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
