export const colors = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  background: '#F5F6FA',
  surface: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#D1D5DB',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  success: '#15803D',
  successBg: '#DCFCE7',
  white: '#FFFFFF',
} as const;

// Estilo do cabeçalho compartilhado pelos layouts de rotas.
export const headerOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.background },
};
