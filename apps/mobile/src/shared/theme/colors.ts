export const colors = {
  background: '#0A0E1A',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceHover: 'rgba(255, 255, 255, 0.10)',
  primary: '#00E5A0',
  primaryDim: 'rgba(0, 229, 160, 0.2)',
  accent: '#F5A623',
  accentDim: 'rgba(245, 166, 35, 0.2)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  error: '#FF6B6B',
  border: 'rgba(255, 255, 255, 0.1)',
} as const;

export type ColorName = keyof typeof colors;
