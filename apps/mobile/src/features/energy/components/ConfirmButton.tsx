import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';

interface ConfirmButtonProps {
  onPress: () => void;
}

export function ConfirmButton({ onPress }: ConfirmButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}>
      <Text style={styles.label}>确认今日能量</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(207, 250, 254, 0.08)',
    borderColor: 'rgba(207, 250, 254, 0.22)',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 50,
    justifyContent: 'center',
    opacity: 0.78,
    paddingHorizontal: spacing[5],
    shadowColor: colors.primary,
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  label: {
    color: '#ECFEFF',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  pressed: {
    opacity: 1,
    transform: [{ scale: 0.98 }],
  },
});
