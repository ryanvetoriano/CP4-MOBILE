import { useRouter } from 'expo-router';

import Screen from '@/components/Screen';
import TaskEditor from '@/components/TaskEditor';
import { useToast } from '@/context/ToastContext';
import { createTask } from '@/services/tasksService';
import type { TaskInput } from '@/types/task';

export default function NewTaskScreen() {
  const router = useRouter();
  const showToast = useToast();

  async function handleCreate(input: TaskInput) {
    await createTask(input);
    showToast('Tarefa cadastrada com sucesso!');
    // Volta para a lista (ou abre a lista, se o cadastro foi aberto pela Home).
    router.dismissTo('/tasks');
  }

  return (
    <Screen subtitle="Preencha os dados para cadastrar uma nova tarefa.">
      <TaskEditor submitLabel="Cadastrar tarefa" onSubmit={handleCreate} onCancel={() => router.back()} />
    </Screen>
  );
}
