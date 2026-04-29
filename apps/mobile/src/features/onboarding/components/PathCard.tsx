import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';

interface PathCardProps {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  title: string;
}

export function PathCard({ description, icon, onPress, title }: PathCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.iconBox}>
        <Ionicons color={colors.text} name={icon} size={22} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.chevron}>
        <Ionicons color={colors.textSecondary} name="chevron-forward" size={16} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing[3],
    minHeight: 94,
    padding: spacing[4],
  },
  chevron: {
    alignItems: 'center',
    backgroundColor: colors.surfaceHover,
    borderRadius: radii.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  copy: {
    flex: 1,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    marginTop: spacing[1],
  },
  iconBox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
});
