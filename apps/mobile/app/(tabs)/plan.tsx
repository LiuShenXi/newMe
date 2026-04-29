import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyLevel } from '../../src/features/plan/components/EmptyLevel';
import { MonthView } from '../../src/features/plan/components/MonthView';
import { YearView } from '../../src/features/plan/components/YearView';
import { usePlan } from '../../src/features/plan/hooks/usePlan';
import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../src/shared/theme';

export default function PlanScreen() {
  const { manualLevels, monthWeeks, quarters, setView, view } = usePlan();

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.segmented}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setView('month')}
            style={[styles.segmentButton, view === 'month' ? styles.segmentActive : null]}
          >
            <Text style={[styles.segmentText, view === 'month' ? styles.segmentTextActive : null]}>周/月计划</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setView('year')}
            style={[styles.segmentButton, view === 'year' ? styles.segmentActive : null]}
          >
            <Text style={[styles.segmentText, view === 'year' ? styles.segmentTextActive : null]}>年/季度</Text>
          </Pressable>
        </View>

        <View style={styles.manualCard}>
          <View style={styles.manualHeader}>
            <View>
              <Text style={styles.eyebrow}>planning source</Text>
              <Text style={styles.manualTitle}>自己掌控粒度，空着也可以继续走</Text>
            </View>
            <Text style={styles.sourcePill}>手动 OKR</Text>
          </View>
          <View style={styles.levelGrid}>
            {manualLevels.map((level) => (
              <EmptyLevel key={level.label} level={level} />
            ))}
          </View>
        </View>

        {view === 'month' ? <MonthView weeks={monthWeeks} /> : <YearView quarters={quarters} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[4],
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[10],
  },
  eyebrow: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xs,
  },
  levelGrid: {
    gap: spacing[2],
    marginTop: spacing[4],
  },
  manualCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing[4],
  },
  manualHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  manualTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.md,
    marginTop: spacing[1],
  },
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  segmented: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[1],
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: radii.md,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
  segmentTextActive: {
    color: colors.background,
  },
  sourcePill: {
    backgroundColor: 'rgba(245, 166, 35, 0.14)',
    borderRadius: radii.pill,
    color: '#FEF3C7',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xs,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
});
