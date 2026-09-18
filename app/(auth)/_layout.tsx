import { Stack } from 'expo-router';
import { headerOptions } from '@/theme';

export default function AuthLayout() {
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="login" options={{ title: 'Entrar' }} />
      <Stack.Screen name="register" options={{ title: 'Cadastro' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Recuperar senha' }} />
    </Stack>
  );
}
