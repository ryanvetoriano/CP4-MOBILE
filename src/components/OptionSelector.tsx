import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type Option<T extends string> = { value: T; label: string };

type OptionSelectorProps<T extends string> = {
  label?: string;
  options: readonly Option<T>[];
  value: T | '';
  onChange: (value: T) => void;
  error?: string;
};

// Grupo de opções em formato de "chips" (usado para prioridade, status e filtros).
export default function OptionSelector<T extends string>({ label, options, value, onChange, error }: OptionSelectorProps<T>) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              aria-checked={selected}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                error && !selected ? styles.chipError : null,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipError: { borderColor: colors.danger },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  chipTextSelected: { color: colors.white },
  pressed: { opacity: 0.7 },
  error: { color: colors.danger, fontSize: 13, marginTop: 4 },
});
