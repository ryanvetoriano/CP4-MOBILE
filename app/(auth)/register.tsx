import { useState } from 'react';
import { useRouter } from 'expo-router';

import Screen from '@/components/Screen';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import Message from '@/components/Message';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/services/authErrors';
import { hasErrors, validateRegister, type FieldErrors, type RegisterForm } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const goToLogin = () => (router.canGoBack() ? router.back() : router.replace('/login'));
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldErrors<RegisterForm>>({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof RegisterForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleRegister() {
    setFeedback('');
    const validation = validateRegister(form);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setLoading(true);
    try {
      // Após o cadastro o usuário já fica autenticado e é levado para a área logada.
      await register(form);
    } catch (error) {
      setFeedback(getAuthErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <Screen title="Criar conta" subtitle="Preencha os dados abaixo para se cadastrar.">
      <Message type="error" text={feedback} />

      <FormInput
        label="Nome"
        placeholder="Seu nome completo"
        value={form.name}
        onChangeText={setField('name')}
        error={errors.name}
        autoCapitalize="words"
        textContentType="name"
      />
      <FormInput
        label="E-mail"
        placeholder="seu@email.com"
        value={form.email}
        onChangeText={setField('email')}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormInput
        label="Senha"
        placeholder="Mínimo de 6 caracteres"
        value={form.password}
        onChangeText={setField('password')}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
      />
      <FormInput
        label="Confirmar senha"
        placeholder="Repita a senha"
        value={form.confirmPassword}
        onChangeText={setField('confirmPassword')}
        error={errors.confirmPassword}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
        onSubmitEditing={handleRegister}
      />

      <Button title="Cadastrar" onPress={handleRegister} loading={loading} />
      <Button title="Já tenho conta" variant="link" onPress={goToLogin} />
    </Screen>
  );
}
