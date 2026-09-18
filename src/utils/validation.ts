const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginForm = {
  email: string;
  password: string;
};

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Informe seu e-mail.';
  if (!isValidEmail(email)) return 'Informe um e-mail válido.';
  return undefined;
}

export function validateRegister({ name, email, password, confirmPassword }: RegisterForm) {
  const errors: FieldErrors<RegisterForm> = {};

  if (!name.trim()) errors.name = 'Informe seu nome.';

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) errors.password = 'Informe uma senha.';
  else if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.';

  if (!confirmPassword) errors.confirmPassword = 'Confirme sua senha.';
  else if (password !== confirmPassword) errors.confirmPassword = 'As senhas não conferem.';

  return errors;
}

export function validateLogin({ email, password }: LoginForm) {
  const errors: FieldErrors<LoginForm> = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) errors.password = 'Informe sua senha.';

  return errors;
}

export function validateEmailOnly(email: string) {
  const errors: FieldErrors<{ email: string }> = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  return errors;
}
