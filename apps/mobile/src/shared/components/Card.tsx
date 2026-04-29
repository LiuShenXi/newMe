import type { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewProps, ViewStyle } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../theme';

interface CardProps extends PropsWithChildren<ViewProps> {
  description?: string;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

export function Card({ children, description, style, title, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing[4],
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    marginBottom: spacing[3],
    marginTop: spacing[1],
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.lg,
  },
});
