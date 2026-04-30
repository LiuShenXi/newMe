import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard, PrototypeScreen } from '../../../shared/components/PrototypeShell';
import { colors, fontSizes, fontWeights, lineHeights, spacing } from '../../../shared/theme';

interface OnboardingScreenProps extends PropsWithChildren {
  eyebrow: string;
  subtitle?: string;
  title: string;
}

export function OnboardingScreen({ children, eyebrow, subtitle, title }: OnboardingScreenProps) {
  return (
    <PrototypeScreen contentStyle={styles.container}>
      <GlassCard style={styles.hero}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </GlassCard>
      <View style={styles.content}>{children}</View>
    </PrototypeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  content: {
    gap: 12,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(254, 240, 138, 0.14)',
    borderColor: 'rgba(254, 240, 138, 0.20)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#FEF3C7',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xs,
    marginBottom: spacing[2],
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hero: {
    minHeight: 182,
    padding: 20,
  },
  subtitle: {
    color: 'rgba(226, 232, 240, 0.78)',
    fontSize: fontSizes.sm,
    lineHeight: 22,
    marginTop: spacing[3],
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: fontWeights.heavy,
    lineHeight: 32,
  },
});
