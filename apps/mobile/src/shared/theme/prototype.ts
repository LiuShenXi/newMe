import type { TextStyle, ViewStyle } from 'react-native';

export const prototype = {
  size: {
    phoneWidth: 393,
    phoneHeight: 812,
    contentX: 20,
    contentTop: 16,
    statusHeight: 20,
    mainTop: 12,
    bottomNavHeight: 70,
    bottomNavInsetWeb: 20,
  },
  color: {
    bg: '#030606',
    phone: '#07110F',
    text: '#F1F5F9',
    muted: '#94A3B8',
    dim: '#64748B',
    cyan: '#55FFE0',
    softCyan: '#CFFAFE',
    gold: '#FEF3C7',
    amber: '#FACC15',
    glass: 'rgba(255, 255, 255, 0.045)',
    glassStrong: 'rgba(10, 22, 19, 0.85)',
    glassBorder: 'rgba(167, 243, 208, 0.10)',
    cyanBorder: 'rgba(207, 250, 254, 0.20)',
  },
  radius: {
    card: 26,
    panel: 30,
    canvas: 34,
    control: 16,
    item: 18,
    nav: 26,
    navItem: 16,
    pill: 999,
  },
} as const;

export const prototypePhoneBackground = {
  backgroundImage:
    'radial-gradient(circle at 50% 8%, rgba(37, 255, 219, .12), transparent 28%), radial-gradient(circle at 20% 90%, rgba(120, 255, 175, .10), transparent 35%), linear-gradient(180deg, #091411 0%, #060b0a 55%, #030605 100%)',
} as unknown as ViewStyle;

export const prototypeGridBackground = {
  backgroundImage:
    'linear-gradient(rgba(255, 255, 255, .04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .035) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
} as unknown as ViewStyle;

export const prototypeGlassBlur = {
  backdropFilter: 'blur(20px)',
} as unknown as ViewStyle;

export const prototypeGlassShadow = {
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, .08), 0 20px 48px rgba(0, 0, 0, .22)',
} as unknown as ViewStyle;

export const prototypePrimaryShadow = {
  boxShadow: '0 0 30px rgba(63, 255, 227, .12)',
} as unknown as ViewStyle;

export const prototypeNumberFont = {
  fontWeight: '300',
  letterSpacing: 0,
} as TextStyle;
