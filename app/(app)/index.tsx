import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import Screen from '@/components/Screen';
import Button from '@/components/Button';
import Message from '@/components/Message';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { OFFLINE_MESSAGE } from '@/services/firestoreErrors';
import type { TaskStatus } from '@/types/task';
import { formatDate } from '@/utils/date';
import { colors } from '@/theme';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.stat, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, loading, offline, error, retry } = useTasks();

  const count = (status: TaskStatus) => tasks.filter((task) => task.status === status).length;
  // As tarefas já chegam do Firestore ordenadas pela data de entrega.
  const upcoming = tasks.filter((task) => task.status !== 'concluida').slice(0, 3);

  return (
    <Screen title={`Olá, ${user?.name || 'usuário'}!`} subtitle="Acompanhe e organize suas tarefas.">
      <Text style={styles.section}>Resumo</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : error ? (
        <View>
          <Message type="error" text={error} />
          <Button title="Tentar novamente" variant="outline" onPress={retry} />
        </View>
      ) : (
        <>
          <Message type="error" text={offline ? OFFLINE_MESSAGE : ''} />
          <View style={styles.stats}>
            <StatCard label="Total" value={tasks.length} color={colors.primary} />
            <StatCard label="Pendentes" value={count('pendente')} color={colors.warning} />
            <StatCard label="Em andamento" value={count('em_andamento')} color={colors.info} />
            <StatCard label="Concluídas" value={count('concluida')} color={colors.success} />
          </View>

          <Text style={styles.section}>Próximas entregas</Text>
          {upcoming.length === 0 ? (
            <Text style={styles.empty}>Nenhuma tarefa em aberto.</Text>
          ) : (
            upcoming.map((task) => (
              <Pressable
                key={task.id}
                style={({ pressed }) => [styles.upcoming, pressed && styles.pressed]}
                onPress={() => router.push({ pathname: '/tasks/[id]', params: { id: task.id } })}
                accessibilityRole="button"
                accessibilityLabel={`Editar ${task.title}`}
              >
                <Text style={styles.upcomingTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={styles.upcomingDate}>{formatDate(task.dueDate)}</Text>
              </Pressable>
            ))
          )}
        </>
      )}

      <View style={styles.actions}>
        <Button title="Nova tarefa" onPress={() => router.push('/tasks/new')} />
        <Button title="Minhas tarefas" variant="outline" onPress={() => router.push('/tasks')} />
        <Button title="Minha conta" variant="link" onPress={() => router.push('/profile')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  loading: { marginVertical: 24 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderLeftWidth: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  empty: { fontSize: 15, color: colors.textMuted, marginBottom: 8 },
  upcoming: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.6 },
  upcomingTitle: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  upcomingDate: { fontSize: 14, color: colors.textMuted },
  actions: { marginTop: 20 },
});
