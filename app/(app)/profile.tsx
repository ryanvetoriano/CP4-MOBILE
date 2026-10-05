import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Screen from '@/components/Screen';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import Message from '@/components/Message';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage, getErrorCode } from '@/services/authErrors';
import { getFirestoreErrorMessage } from '@/services/firestoreErrors';
import { confirm } from '@/utils/confirm';
import { colors } from '@/theme';

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('pt-BR');
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '-'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  async function handleLogout() {
    setFeedback('');
    setLoggingOut(true);
    try {
      // O Stack.Protected leva o usuário de volta para o login após o logout.
      await logout();
    } catch (error) {
      setFeedback(getAuthErrorMessage(error));
      setLoggingOut(false);
    }
  }

  async function runDelete(currentPassword?: string) {
    setFeedback('');
    setDeleting(true);
    try {
      await deleteAccount(currentPassword);
    } catch (error) {
      const code = getErrorCode(error);
      if (code === 'auth/requires-recent-login') {
        setNeedsPassword(true);
      }
      // A exclusão também remove as tarefas no Firestore, que tem códigos de erro próprios.
      setFeedback(code?.startsWith('auth/') ? getAuthErrorMessage(error) : getFirestoreErrorMessage(error));
      setDeleting(false);
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Excluir conta',
      message: 'Tem certeza que deseja excluir sua conta? Todas as suas tarefas também serão excluídas e essa ação não poderá ser desfeita.',
      confirmText: 'Excluir',
      destructive: true,
    });
    if (confirmed) runDelete();
  }

  function handleConfirmWithPassword() {
    if (!password) {
      setPasswordError('Informe sua senha.');
      return;
    }
    setPasswordError('');
    runDelete(password);
  }

  function cancelPasswordConfirmation() {
    setNeedsPassword(false);
    setPassword('');
    setFeedback('');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>Olá, {user?.name || 'usuário'}!</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Text style={styles.section}>Informações da conta</Text>
      <InfoRow label="Nome" value={user?.name} />
      <InfoRow label="E-mail" value={user?.email} />
      <InfoRow label="Conta criada em" value={formatDate(user?.createdAt)} />
      <InfoRow label="Último login" value={formatDate(user?.lastLoginAt)} />

      <View style={styles.actions}>
        <Message type="error" text={feedback} />

        {needsPassword ? (
          <View>
            <FormInput
              label="Confirme sua senha para excluir a conta"
              placeholder="Sua senha"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry
              autoCapitalize="none"
            />
            <Button title="Confirmar exclusão" variant="danger" onPress={handleConfirmWithPassword} loading={deleting} />
            <Button title="Cancelar" variant="link" onPress={cancelPasswordConfirmation} />
          </View>
        ) : (
          <>
            <Button title="Sair da conta" variant="outline" onPress={handleLogout} loading={loggingOut} disabled={deleting} />
            <Button title="Excluir conta" variant="danger" onPress={handleDelete} loading={deleting} disabled={loggingOut} />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  email: { fontSize: 15, color: colors.textMuted, marginTop: 2 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 15, color: colors.textMuted },
  rowValue: { fontSize: 15, color: colors.text, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  actions: { marginTop: 24 },
});
