import { StyleSheet, Text, View } from 'react-native';

import Button from './Button';
import { colors } from '../theme';
import { PRIORITY_LABELS, STATUS_LABELS, type Task, type TaskPriority, type TaskStatus } from '../types/task';
import { formatDate, isBeforeToday } from '../utils/date';

const STATUS_COLORS: Record<TaskStatus, { text: string; bg: string }> = {
  pendente: { text: colors.warning, bg: colors.warningBg },
  em_andamento: { text: colors.info, bg: colors.infoBg },
  concluida: { text: colors.success, bg: colors.successBg },
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  baixa: colors.textMuted,
  media: colors.warning,
  alta: colors.danger,
};

function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

type TaskCardProps = {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
};

export default function TaskCard({ task, onEdit, onDelete, deleting = false }: TaskCardProps) {
  const status = STATUS_COLORS[task.status] ?? STATUS_COLORS.pendente;
  const overdue = task.status !== 'concluida' && isBeforeToday(task.dueDate);

  return (
    <View style={styles.card}>
      <Text style={[styles.title, task.status === 'concluida' && styles.done]}>{task.title}</Text>

      <View style={styles.badges}>
        <Badge text={STATUS_LABELS[task.status] ?? task.status} color={status.text} bg={status.bg} />
        {overdue ? <Badge text="Atrasada" color={colors.danger} bg={colors.dangerBg} /> : null}
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {task.description}
      </Text>

      <View style={styles.meta}>
        <Text style={styles.metaText}>
          Categoria: <Text style={styles.metaValue}>{task.category}</Text>
        </Text>
        <Text style={styles.metaText}>
          Entrega: <Text style={[styles.metaValue, overdue && { color: colors.danger }]}>{formatDate(task.dueDate)}</Text>
        </Text>
        <Text style={styles.metaText}>
          Prioridade:{' '}
          <Text style={[styles.metaValue, { color: PRIORITY_COLORS[task.priority] ?? colors.text }]}>
            {PRIORITY_LABELS[task.priority] ?? task.priority}
          </Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button title="Editar" variant="outline" onPress={onEdit} disabled={deleting} />
        </View>
        <View style={styles.action}>
          <Button title="Excluir" variant="danger" onPress={onDelete} loading={deleting} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  done: { textDecorationLine: 'line-through', color: colors.textMuted },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  description: { fontSize: 15, color: colors.text, marginTop: 10, lineHeight: 21 },
  meta: { marginTop: 10, gap: 2 },
  metaText: { fontSize: 14, color: colors.textMuted },
  metaValue: { color: colors.text, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  action: { flex: 1 },
});
