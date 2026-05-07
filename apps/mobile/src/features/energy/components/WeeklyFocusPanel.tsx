import { StyleSheet, Text, View } from 'react-native';

import { fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';
import type { WeeklyFocusProgress } from '../hooks/useEnergy';

interface WeeklyFocusPanelProps {
  focuses: WeeklyFocusProgress[];
}

export function WeeklyFocusPanel({ focuses }: WeeklyFocusPanelProps) {
  return (
    <View style={styles.panel} testID="weekly-progress-panel">
      <View style={styles.header}>
        <Text style={styles.title}>本周进度概览</Text>
        <Text style={styles.badge} testID="weekly-progress-badge">打分参照</Text>
      </View>
      <View style={styles.list}>
        {focuses.length > 0 ? (
          focuses.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.meta}>
                <Text numberOfLines={1} style={styles.itemTitle}>
                  {item.title}
                </Text>
                <Text style={styles.value} testID="weekly-progress-value">{item.value}%</Text>
              </View>
              <View style={styles.track} testID="weekly-progress-track">
                <View style={[styles.fill, { width: `${item.value}%` }]} testID="weekly-progress-fill" />
              </View>
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
    backgroundColor: 'transparent',
    borderColor: 'rgba(143, 179, 170, 0.24)',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    color: 'rgba(144, 190, 178, 0.74)',
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
    backgroundColor: '#7DD3CA',
    borderRadius: radii.pill,
    height: '100%',
    opacity: 0.9,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  item: {
    gap: 7,
  },
  itemTitle: {
    color: 'rgba(214, 224, 222, 0.74)',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    gap: 16,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  panel: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    opacity: 1,
    paddingBottom: 6,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  title: {
    color: 'rgba(241, 245, 242, 0.88)',
    fontSize: 16,
    fontWeight: fontWeights.medium,
    lineHeight: 22,
  },
  track: {
    backgroundColor: 'rgba(158, 178, 171, 0.20)',
    borderRadius: radii.pill,
    height: 2,
    overflow: 'hidden',
  },
  value: {
    color: '#CFDDDA',
    fontSize: 13,
    lineHeight: 18,
  },
});
