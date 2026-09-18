import { Stack } from 'expo-router';
import { headerOptions } from '@/theme';

export default function AppLayout() {
  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen name="index" options={{ title: 'Minha conta' }} />
    </Stack>
  );
}
