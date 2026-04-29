import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSizes, fontWeights, lineHeights, spacing } from '../../../shared/theme';

interface OnboardingScreenProps extends PropsWithChildren {
  eyebrow: string;
  subtitle?: string;
  title: string;
}

export function OnboardingScreen({ children, eyebrow, subtitle, title }: OnboardingScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[5],
  },
  content: {
    gap: spacing[4],
    marginTop: spacing[6],
  },
  eyebrow: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xs,
    marginTop: spacing[2],
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    marginTop: spacing[3],
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xxl,
    marginTop: spacing[2],
  },
});
