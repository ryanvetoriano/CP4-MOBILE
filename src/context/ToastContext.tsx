import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';

type ToastType = 'success' | 'error';
type ShowToast = (text: string, type?: ToastType) => void;

const DURATION_MS = 3000;
const ToastContext = createContext<ShowToast | null>(null);

// Mensagem rápida exibida após as operações no Firestore (cadastro, edição e exclusão).
// Funciona igual no celular e na web, ao contrário do Alert.
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ text: string; type: ToastType } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback<ShowToast>((text, type = 'success') => {
    clearTimeout(timer.current);
    setToast({ text, type });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={showToast}>
      <View style={styles.flex}>
        {children}
        {toast ? (
          <View style={[styles.container, { bottom: insets.bottom + 24 }]}>
            <View
              style={[styles.toast, { backgroundColor: toast.type === 'error' ? colors.danger : colors.success }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.text}>{toast.text}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { position: 'absolute', left: 16, right: 16, alignItems: 'center', pointerEvents: 'none' },
  toast: {
    maxWidth: 480,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: { color: colors.white, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
