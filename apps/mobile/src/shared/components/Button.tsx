import type { ReactNode } from 'react';
import { ActivityIndicator, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { colors } from '../theme';
import { PrototypeButton } from './PrototypePrimitives';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  children: string;
  disabled?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: ButtonVariant;
}

export function Button({
  children,
  disabled = false,
  icon,
  loading = false,
  onPress,
  style,
  textStyle,
  variant = 'primary',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PrototypeButton
      disabled={isDisabled}
      icon={loading ? <ActivityIndicator color={variant === 'primary' ? colors.background : colors.primary} /> : icon}
      onPress={onPress}
      style={style}
      textStyle={textStyle}
      variant={variant === 'primary' ? 'primary' : variant === 'secondary' ? 'secondary' : 'ghost'}
    >
      {children}
    </PrototypeButton>
  );
}
