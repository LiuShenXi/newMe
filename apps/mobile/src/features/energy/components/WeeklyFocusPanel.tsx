import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';
import type { WeeklyFocusProgress } from '../hooks/useEnergy';

interface WeeklyFocusPanelProps {
  focuses: WeeklyFocusProgress[];
}

export function WeeklyFocusPanel({ focuses }: WeeklyFocusPanelProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>本周进度概览</Text>
        <Text style={styles.badge}>打分参照</Text>
      </View>
      <View style={styles.list}>
        {focuses.length > 0 ? (
          focuses.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.meta}>
                <Text numberOfLines={1} style={styles.itemTitle}>
                  {item.title}
                </Text>
                <Text style={styles.value}>{item.value}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${item.value}%` }]} />
              </View>
              <Text numberOfLines={1} style={styles.note}>
                {item.note}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            本周重点暂未设置。你仍然可以先记录今天的主观推进，之后再回计划页补上本周计划。
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(167, 243, 208, 0.10)',
    borderRadius: radii.pill,
    color: 'rgba(209, 250, 229, 0.72)',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  empty: {
    borderColor: 'rgba(148, 163, 184, 0.24)',
    borderRadius: radii.md,
    borderStyle: 'dashed',
    borderWidth: StyleSheet.hairlineWidth,
    color: '#94A3B8',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
    padding: spacing[3],
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  item: {
    gap: spacing[1],
  },
  itemTitle: {
    color: '#E2E8F0',
    flex: 1,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  list: {
    gap: spacing[3],
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  note: {
    color: colors.textTertiary,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  panel: {
    backgroundColor: 'rgba(18, 36, 31, 0.72)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    opacity: 1,
    padding: spacing[4],
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.sm,
  },
  track: {
    backgroundColor: 'rgba(241, 245, 249, 0.10)',
    borderRadius: radii.pill,
    height: 6,
    overflow: 'hidden',
  },
  value: {
    color: '#CFFAFE',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
});
