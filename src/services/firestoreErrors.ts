import { getErrorCode } from './authErrors';

// Códigos de erro do Cloud Firestore (FirestoreError.code).
const MESSAGES: Record<string, string> = {
  'permission-denied': 'Você não tem permissão para acessar este registro.',
  unauthenticated: 'Sua sessão expirou. Entre novamente para continuar.',
  unavailable: 'Não foi possível conectar ao banco de dados. Verifique sua internet e tente novamente.',
  'deadline-exceeded': 'O servidor demorou para responder. Tente novamente.',
  'not-found': 'Registro não encontrado. Ele pode ter sido excluído.',
  'resource-exhausted': 'Limite de uso do Firestore atingido. Tente novamente mais tarde.',
  'failed-precondition': 'O Cloud Firestore não está configurado corretamente no projeto Firebase.',
  'invalid-argument': 'Dados inválidos. Revise os campos e tente novamente.',
};

export function getFirestoreErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  return (code && MESSAGES[code]) || 'Não foi possível concluir a operação. Tente novamente.';
}
