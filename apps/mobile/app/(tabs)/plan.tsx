import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyLevel } from '../../src/features/plan/components/EmptyLevel';
import { MonthView } from '../../src/features/plan/components/MonthView';
import { YearView } from '../../src/features/plan/components/YearView';
import { usePlan } from '../../src/features/plan/hooks/usePlan';
import { PrototypeScreen } from '../../src/shared/components/PrototypeShell';
import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../src/shared/theme';

export default function PlanScreen() {
  const { error, loading, manualLevels, monthWeeks, planSource, quarters, setView, updateCurrentWeekFocuses, view } = usePlan();
  const showManualOverview = planSource !== 'ai';

  return (
    <View style={styles.root}>
      <PrototypeScreen activeTab="plan" contentStyle={styles.content}>
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

        {loading ? <Text style={styles.statusText}>计划同步中</Text> : null}
        {error ? <Text style={styles.statusText}>{error}</Text> : null}

        {showManualOverview ? (
          <View style={styles.manualCard}>
            <View style={styles.manualHeader}>
              <View>
                <Text style={styles.eyebrow}>planning source</Text>
                <Text style={styles.manualTitle}>自己掌控粒度，空着也可以继续走</Text>
              </View>
              <Text style={styles.sourcePill}>{planSource === 'mixed' ? '手动 + 局部 AI' : '手动 OKR'}</Text>
            </View>
            <View style={styles.levelGrid}>
              {manualLevels.map((level) => (
                <EmptyLevel key={level.label} level={level} />
              ))}
            </View>
          </View>
        ) : null}

        {view === 'month' ? (
          <MonthView
            onSelectWeek={(week) => router.push({ pathname: '/todo', params: { week: week.week } })}
            onUpdateWeekFocuses={updateCurrentWeekFocuses}
            planSource={planSource}
            weeks={monthWeeks}
          />
        ) : (
          <YearView planSource={planSource} quarters={quarters} />
        )}
      </PrototypeScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
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
    backgroundColor: 'rgba(18, 36, 31, 0.72)',
    borderColor: 'rgba(207, 250, 254, 0.15)',
    borderRadius: 22,
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
    flex: 1,
  },
  segmented: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[1],
  },
  segmentActive: {
    backgroundColor: 'rgba(207, 250, 254, 0.12)',
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 17,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  segmentText: {
    color: colors.textDim,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
  },
  segmentTextActive: {
    color: '#ECFEFF',
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
  statusText: {
    color: colors.textDim,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
});
