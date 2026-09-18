import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Variant = 'primary' | 'outline' | 'danger' | 'link';

const VARIANTS: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: colors.primary, text: colors.white, border: colors.primary },
  outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
  danger: { bg: colors.danger, text: colors.white, border: colors.danger },
  link: { bg: 'transparent', text: colors.primary, border: 'transparent' },
};

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
};

export default function Button({ title, onPress, loading = false, disabled = false, variant = 'primary' }: ButtonProps) {
  const theme = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        variant === 'link' && styles.link,
        { backgroundColor: theme.bg, borderColor: theme.border },
        (pressed || isDisabled) && styles.dimmed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.text} />
      ) : (
        <Text style={[styles.text, { color: theme.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  link: { minHeight: 40, marginTop: 4 },
  text: { fontSize: 16, fontWeight: '600' },
  dimmed: { opacity: 0.6 },
});
