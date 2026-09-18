import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type MessageProps = {
  type?: 'error' | 'success';
  text?: string | null;
};

export default function Message({ type = 'error', text }: MessageProps) {
  if (!text) return null;
  const isError = type === 'error';

  return (
    <View
      style={[styles.box, { backgroundColor: isError ? colors.dangerBg : colors.successBg }]}
      accessibilityRole="alert"
    >
      <Text style={[styles.text, { color: isError ? colors.danger : colors.success }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 10, padding: 12, marginBottom: 14 },
  text: { fontSize: 14, lineHeight: 20 },
});
