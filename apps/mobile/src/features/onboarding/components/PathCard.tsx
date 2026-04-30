import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';

interface PathCardProps {
  description: string;
  icon: 'flash-outline' | 'sparkles' | 'square-outline';
  onPress: () => void;
  title: string;
}

const iconTextByName: Record<PathCardProps['icon'], string> = {
  'flash-outline': '↯',
  sparkles: '✦',
  'square-outline': '□',
};

export function PathCard({ description, icon, onPress, title }: PathCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>{iconTextByName[icon]}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 36, 31, 0.72)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing[3],
    minHeight: 94,
    padding: spacing[4],
  },
  chevron: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.pill,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  copy: {
    flex: 1,
  },
  description: {
    color: 'rgba(226, 232, 240, 0.70)',
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    marginTop: spacing[1],
  },
  iconBox: {
    alignItems: 'center',
    borderColor: 'rgba(207, 250, 254, 0.12)',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: fontWeights.heavy,
    lineHeight: 26,
  },
  pressed: {
    opacity: 0.84,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.md,
  },
  chevronText: {
    color: colors.textSecondary,
    fontSize: 22,
    lineHeight: 24,
  },
});
