import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Message from '@/components/Message';
import OptionSelector, { type Option } from '@/components/OptionSelector';
import TaskCard from '@/components/TaskCard';
import { useToast } from '@/context/ToastContext';
import { useTasks } from '@/hooks/useTasks';
import { getFirestoreErrorMessage, OFFLINE_MESSAGE } from '@/services/firestoreErrors';
import { deleteTask } from '@/services/tasksService';
import { STATUS_OPTIONS, type Task, type TaskStatus } from '@/types/task';
import { confirm } from '@/utils/confirm';
import { colors } from '@/theme';

type Filter = TaskStatus | 'todas';
const FILTER_OPTIONS: Option<Filter>[] = [{ value: 'todas', label: 'Todas' }, ...STATUS_OPTIONS];

export default function TasksScreen() {
  const router = useRouter();
  const showToast = useToast();
  const { tasks, loading, offline, error, retry } = useTasks();
  const [filter, setFilter] = useState<Filter>('todas');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const visibleTasks = filter === 'todas' ? tasks : tasks.filter((task) => task.status === filter);

  async function handleDelete(task: Task) {
    const confirmed = await confirm({
      title: 'Excluir tarefa',
      message: `Tem certeza que deseja excluir este registro?\n\n"${task.title}"`,
      confirmText: 'Excluir',
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(task.id);
    try {
      // A lista é atualizada sozinha pelo onSnapshot assim que o documento é removido.
      await deleteTask(task.id);
      showToast('Tarefa excluída com sucesso!');
    } catch (err) {
      showToast(getFirestoreErrorMessage(err), 'error');
    } finally {
      setDeletingId(null);
    }
  }

  function renderEmpty() {
    if (loading) return <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />;
    // Sem conexão a lista chega vazia: o aviso do cabeçalho explica, sem dizer que não há registros.
    if (error || offline) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Nenhum registro encontrado.</Text>
        <Text style={styles.emptyText}>
          {filter === 'todas'
            ? 'Você ainda não cadastrou nenhuma tarefa.'
            : 'Não há tarefas com o status selecionado.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Button title="+ Nova tarefa" onPress={() => router.push('/tasks/new')} />
            <View style={styles.filter}>
              <OptionSelector options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
            </View>
            <Message type="error" text={offline && !error ? OFFLINE_MESSAGE : ''} />
            {error ? (
              <View>
                <Message type="error" text={error} />
                <Button title="Tentar novamente" variant="outline" onPress={retry} />
              </View>
            ) : null}
            {!loading && !error && visibleTasks.length > 0 ? (
              <Text style={styles.count}>
                {visibleTasks.length} {visibleTasks.length === 1 ? 'tarefa' : 'tarefas'}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={renderEmpty()}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            deleting={deletingId === item.id}
            onEdit={() => router.push({ pathname: '/tasks/[id]', params: { id: item.id } })}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { marginBottom: 4 },
  filter: { marginTop: 16 },
  count: { fontSize: 14, color: colors.textMuted, marginBottom: 10 },
  loading: { marginTop: 40 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyText: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
});
