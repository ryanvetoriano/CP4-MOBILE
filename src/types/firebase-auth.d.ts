import type { Persistence, ReactNativeAsyncStorage } from '@firebase/auth';

// O bundler usa a versão React Native do Firebase Auth, mas os tipos padrão de
// "firebase/auth" são os da web e não declaram getReactNativePersistence.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
