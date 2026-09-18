import { useState } from 'react';
import { useRouter } from 'expo-router';

import Screen from '@/components/Screen';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import Message from '@/components/Message';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/services/authErrors';
import { hasErrors, validateLogin, type FieldErrors, type LoginForm } from '@/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<LoginForm>>({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setFeedback('');
    const validation = validateLogin({ email, password });
    setErrors(validation);
    if (hasErrors(validation)) return;

    setLoading(true);
    try {
      // Em caso de sucesso o AuthContext atualiza o usuário e o Stack.Protected
      // redireciona automaticamente para a área autenticada.
      await login({ email, password });
    } catch (error) {
      setFeedback(getAuthErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <Screen title="Bem-vindo(a)" subtitle="Entre com seu e-mail e senha para continuar.">
      <Message type="error" text={feedback} />

      <FormInput
        label="E-mail"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormInput
        label="Senha"
        placeholder="Sua senha"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        textContentType="password"
        onSubmitEditing={handleLogin}
      />

      <Button title="Entrar" onPress={handleLogin} loading={loading} />
      <Button
        title="Esqueci minha senha"
        variant="link"
        onPress={() => router.push({ pathname: '/forgot-password', params: { email } })}
      />
      <Button title="Criar uma conta" variant="outline" onPress={() => router.push('/register')} />
    </Screen>
  );
}
