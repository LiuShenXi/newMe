import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';
import type { ManualLevel } from '../hooks/usePlan';

interface EmptyLevelProps {
  level: ManualLevel;
}

export function EmptyLevel({ level }: EmptyLevelProps) {
  const isEmpty = !level.value;

  return (
    <View style={[styles.card, isEmpty ? styles.empty : null]}>
      <View style={styles.copy}>
        <Text style={styles.label}>{level.label}</Text>
        <Text numberOfLines={2} style={[styles.value, isEmpty ? styles.emptyValue : null]}>
          {level.value || '暂未设置'}
        </Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.action}>
        <Text style={styles.actionText}>{isEmpty ? level.action : '编辑'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    backgroundColor: 'rgba(207, 250, 254, 0.10)',
    borderColor: 'rgba(207, 250, 254, 0.16)',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  actionText: {
    color: '#ECFEFF',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
    padding: spacing[3],
  },
  copy: {
    flex: 1,
    gap: spacing[1],
  },
  empty: {
    backgroundColor: 'rgba(255, 255, 255, 0.032)',
  },
  emptyValue: {
    color: colors.textTertiary,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  value: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
});
