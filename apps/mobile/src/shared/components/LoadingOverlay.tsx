import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../theme';

interface LoadingOverlayProps {
  message?: string;
  visible: boolean;
}

export function LoadingOverlay({ message = '正在处理...', visible }: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.panel}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.md,
    marginTop: spacing[3],
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 26, 0.72)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  panel: {
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
  },
});
