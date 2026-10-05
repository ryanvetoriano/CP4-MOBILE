import { Stack } from 'expo-router';
import { ToastProvider } from '@/context/ToastContext';
import { headerOptions } from '@/theme';

export default function AppLayout() {
  return (
    <ToastProvider>
      <Stack screenOptions={headerOptions}>
        <Stack.Screen name="index" options={{ title: 'Início' }} />
        <Stack.Screen name="tasks/index" options={{ title: 'Minhas tarefas' }} />
        <Stack.Screen name="tasks/new" options={{ title: 'Nova tarefa' }} />
        <Stack.Screen name="tasks/[id]" options={{ title: 'Editar tarefa' }} />
        <Stack.Screen name="profile" options={{ title: 'Minha conta' }} />
      </Stack>
    </ToastProvider>
  );
}
