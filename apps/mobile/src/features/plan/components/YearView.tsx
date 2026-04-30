import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, fontWeights, lineHeights, radii, spacing } from '../../../shared/theme';
import type { PlanSource, QuarterPlan } from '../hooks/usePlan';

interface YearViewProps {
  planSource: PlanSource;
  quarters: QuarterPlan[];
}

export function YearView({ planSource, quarters }: YearViewProps) {
  const isAiSource = planSource === 'ai';

  return (
    <View style={styles.list}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>2026 · yearly map</Text>
        <Text style={styles.introTitle}>{isAiSource ? '年度只看四个季度的阶段变化' : '上层目标可以慢慢补齐，不影响今天开始'}</Text>
      </View>
      {quarters.map((quarter) => (
        <View key={quarter.id} style={[styles.card, quarter.id === 'Q2' ? styles.current : null]}>
          <View style={styles.header}>
            <Text style={styles.badge}>{quarter.id}</Text>
            <Text style={styles.score}>{quarter.score === null ? '未开始' : `${quarter.score}%`}</Text>
          </View>
          <Text style={styles.title}>{quarter.title}</Text>
          <Text style={styles.desc}>{quarter.desc}</Text>
          <View style={styles.goals}>
            {quarter.goals.map((goal, index) => (
              <View key={goal} style={styles.goal}>
                <Text style={styles.goalIndex}>{index + 1}</Text>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { opacity: quarter.score === null ? 0.2 : 1, width: `${quarter.score ?? 0}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(245, 166, 35, 0.14)',
    borderRadius: radii.md,
    color: '#FEF3C7',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing[3],
    padding: spacing[4],
  },
  current: {
    borderColor: 'rgba(245, 166, 35, 0.32)',
  },
  desc: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.heavy,
    lineHeight: lineHeights.xs,
  },
  fill: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    height: '100%',
  },
  goal: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[2],
  },
  goalIndex: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.pill,
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    height: 22,
    lineHeight: 22,
    overflow: 'hidden',
    textAlign: 'center',
    width: 22,
  },
  goalText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.sm,
  },
  goals: {
    gap: spacing[2],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intro: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing[4],
  },
  introTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.md,
    marginTop: spacing[1],
  },
  list: {
    gap: spacing[3],
  },
  score: {
    color: '#CFFAFE',
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  title: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.lg,
  },
  track: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.pill,
    height: 6,
    overflow: 'hidden',
  },
});
