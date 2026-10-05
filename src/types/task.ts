export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida';
export type TaskPriority = 'baixa' | 'media' | 'alta';

// Dados informados no formulário de cadastro/edição.
export type TaskInput = {
  title: string;
  description: string;
  category: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
};

// Tarefa lida do Firestore (usuarios/{uid}/tarefas/{tarefaId}).
export type Task = Omit<TaskInput, 'dueDate'> & {
  id: string;
  dueDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

// Os mesmos limites são validados no app e nas regras do Firestore (firestore.rules).
export const TASK_LIMITS = { title: 80, description: 500, category: 40 } as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export const STATUS_OPTIONS = toOptions(STATUS_LABELS);
export const PRIORITY_OPTIONS = toOptions(PRIORITY_LABELS);
