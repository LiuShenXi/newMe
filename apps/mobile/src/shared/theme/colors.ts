export const colors = {
  background: '#030606',
  phoneBackground: '#07110F',
  surface: 'rgba(255, 255, 255, 0.045)',
  surfaceHover: 'rgba(255, 255, 255, 0.10)',
  surfaceStrong: 'rgba(10, 22, 19, 0.85)',
  primary: '#55FFE0',
  primaryDim: 'rgba(207, 250, 254, 0.12)',
  accent: '#E9D58A',
  accentDim: 'rgba(254, 240, 138, 0.12)',
  text: '#F4FFF9',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textDim: '#64748B',
  danger: '#F43F5E',
  error: '#F87171',
  border: 'rgba(167, 243, 208, 0.10)',
  cyanBorder: 'rgba(207, 250, 254, 0.20)',
  goldBorder: 'rgba(254, 240, 138, 0.18)',
} as const;

export type ColorName = keyof typeof colors;
