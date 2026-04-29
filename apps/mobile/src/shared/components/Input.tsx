import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../theme';

interface InputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
  label?: string;
}

export function Input({ containerStyle, error, label, style, ...rest }: InputProps) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.primary}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.error,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    marginTop: spacing[2],
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    minHeight: 48,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  inputError: {
    borderColor: colors.error,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
    marginBottom: spacing[2],
  },
});
