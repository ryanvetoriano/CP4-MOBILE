import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Screen from '@/components/Screen';
import Button from '@/components/Button';
import Message from '@/components/Message';
import TaskEditor from '@/components/TaskEditor';
import { useToast } from '@/context/ToastContext';
import { getFirestoreErrorMessage } from '@/services/firestoreErrors';
import { getTask, updateTask } from '@/services/tasksService';
import type { Task, TaskInput } from '@/types/task';
import { colors } from '@/theme';

export default function EditTaskScreen() {
  const router = useRouter();
  const showToast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carrega a tarefa direto do Firestore para preencher o formulário.
  useEffect(() => {
    let active = true;
    setLoading(true);
    getTask(id)
      .then((found) => {
        if (!active) return;
        if (found) setTask(found);
        else setError('Tarefa não encontrada. Ela pode ter sido excluída.');
      })
      .catch((err) => active && setError(getFirestoreErrorMessage(err)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  async function handleUpdate(input: TaskInput) {
    await updateTask(id, input);
    showToast('Tarefa atualizada com sucesso!');
    router.dismissTo('/tasks');
  }

  return (
    <Screen subtitle={task ? 'Altere os dados e salve para atualizar a tarefa.' : undefined}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
      ) : task ? (
        <TaskEditor task={task} submitLabel="Salvar alterações" onSubmit={handleUpdate} onCancel={() => router.back()} />
      ) : (
        <>
          <Message type="error" text={error} />
          <Button title="Voltar para a lista" variant="outline" onPress={() => router.dismissTo('/tasks')} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginVertical: 32 },
});
