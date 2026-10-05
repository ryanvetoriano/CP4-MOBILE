import { TASK_LIMITS, type TaskPriority, type TaskStatus } from '../types/task';
import { parseDate } from './date';

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

export type TaskForm = {
  title: string;
  description: string;
  category: string;
  dueDate: string; // DD/MM/AAAA
  priority: TaskPriority | '';
  status: TaskStatus | '';
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

function validateText(value: string, max: number, emptyMessage: string, label: string): string | undefined {
  if (!value.trim()) return emptyMessage;
  if (value.trim().length > max) return `${label} deve ter no máximo ${max} caracteres.`;
  return undefined;
}

export function validateTask({ title, description, category, dueDate, priority, status }: TaskForm) {
  const errors: FieldErrors<TaskForm> = {};

  const titleError = validateText(title, TASK_LIMITS.title, 'Informe o título da tarefa.', 'O título');
  if (titleError) errors.title = titleError;

  const descriptionError = validateText(description, TASK_LIMITS.description, 'Informe a descrição.', 'A descrição');
  if (descriptionError) errors.description = descriptionError;

  const categoryError = validateText(category, TASK_LIMITS.category, 'Informe a categoria.', 'A categoria');
  if (categoryError) errors.category = categoryError;

  if (!dueDate.trim()) errors.dueDate = 'Informe a data de entrega.';
  else if (!parseDate(dueDate)) errors.dueDate = 'Informe uma data válida no formato DD/MM/AAAA.';

  if (!priority) errors.priority = 'Selecione a prioridade.';
  if (!status) errors.status = 'Selecione o status.';

  return errors;
}
