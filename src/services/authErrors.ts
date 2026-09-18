const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'O e-mail informado é inválido.',
  'auth/missing-email': 'Informe o e-mail.',
  'auth/missing-password': 'Informe a senha.',
  'auth/email-already-in-use': 'Já existe uma conta cadastrada com este e-mail.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet e tente novamente.',
  'auth/requires-recent-login': 'Por segurança, confirme sua senha para continuar.',
  'auth/user-mismatch': 'A senha informada não corresponde à conta conectada.',
  'auth/operation-not-allowed': 'Login por e-mail e senha não está habilitado no Firebase.',
  'auth/invalid-api-key': 'Configuração do Firebase inválida. Verifique o arquivo .env.',
};

export function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

export function getAuthErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  return (code && MESSAGES[code]) || 'Ocorreu um erro inesperado. Tente novamente.';
}
