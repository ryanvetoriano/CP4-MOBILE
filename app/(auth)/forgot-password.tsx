import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Screen from '@/components/Screen';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import Message from '@/components/Message';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage, getErrorCode } from '@/services/authErrors';
import { hasErrors, validateEmailOnly } from '@/utils/validation';

const SUCCESS_MESSAGE =
  'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.';

type Feedback = { type: 'error' | 'success'; text: string } | null;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const goToLogin = () => (router.canGoBack() ? router.back() : router.replace('/login'));
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(params.email ?? '');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setFeedback(null);
    const validation = validateEmailOnly(email);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setFeedback({ type: 'success', text: SUCCESS_MESSAGE });
    } catch (error) {
      // Não revelamos se o e-mail existe ou não na base.
      if (getErrorCode(error) === 'auth/user-not-found') {
        setFeedback({ type: 'success', text: SUCCESS_MESSAGE });
      } else {
        setFeedback({ type: 'error', text: getAuthErrorMessage(error) });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      title="Esqueci minha senha"
      subtitle="Informe o e-mail da sua conta para receber o link de redefinição."
    >
      <Message type={feedback?.type} text={feedback?.text} />

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
        onSubmitEditing={handleReset}
      />

      <Button title="Enviar link de recuperação" onPress={handleReset} loading={loading} />
      <Button title="Voltar para o login" variant="link" onPress={goToLogin} />
    </Screen>
  );
}
